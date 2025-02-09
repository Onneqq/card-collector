import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc, 
  arrayUnion, 
  serverTimestamp,
  Timestamp,
  increment,
  getDocs,
  writeBatch
} from 'firebase/firestore';

// Initialize user data when they first sign up
export async function initializeUserData(userId, email) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    await setDoc(userRef, {
      email,
      breadBalance: 100, // Starting balance
      lastBreadClaim: null,
      ownedImages: [],
      createdAt: serverTimestamp(),
    });
  }
}

// Get user data including balance and owned images
export async function getUserData(userId) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  
  return userDoc.data();
}

// Purchase an image
export async function purchaseImage(userId, imageData, price) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  
  const userData = userDoc.data();
  
  if (userData.breadBalance < price) {
    throw new Error('Insufficient $BREAD balance');
  }
  
  await updateDoc(userRef, {
    breadBalance: userData.breadBalance - price,
    ownedImages: arrayUnion({
      ...imageData,
      purchasedAt: Timestamp.now(),
      price,
    }),
  });
}

// Claim weekly $BREAD
export async function claimWeeklyBread(userId) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  
  const userData = userDoc.data();
  const now = new Date();
  const lastClaim = userData.lastBreadClaim?.toDate();
  
  // Check if a week has passed since last claim
  if (lastClaim && now - lastClaim < 7 * 24 * 60 * 60 * 1000) {
    const nextClaimDate = new Date(lastClaim.getTime() + 7 * 24 * 60 * 60 * 1000);
    throw new Error(`Next claim available on ${nextClaimDate.toLocaleDateString()}`);
  }
  
  const WEEKLY_BREAD = 100;
  
  await updateDoc(userRef, {
    breadBalance: userData.breadBalance + WEEKLY_BREAD,
    lastBreadClaim: serverTimestamp(),
  });
  
  return WEEKLY_BREAD;
}

export async function claimPackImages(userId, selectedImages) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  
  await updateDoc(userRef, {
    ownedImages: arrayUnion(...selectedImages.map(image => ({
      ...image,
      purchasedAt: Timestamp.now(),
      source: 'pack',
    }))),
    currentPack: null, // Remove the current pack after claiming
    pendingPacks: increment(-1), // Decrease pending packs count
  });
}

export async function distributePacksToAllUsers(availableImages) {
  const users = await getAllUsers();
  
  if (availableImages.length < 5) {
    throw new Error('Not enough images available');
  }

  // Distribute packs to all users
  const batch = writeBatch(db);
  
  for (const user of users) {
    // Randomly select 5 images for each user
    const randomImages = getRandomImages(availableImages, 5);
    
    const userRef = doc(db, 'users', user.id);
    batch.update(userRef, {
      currentPack: {
        images: randomImages,
        openedAt: Timestamp.now(),
      },
      pendingPacks: increment(1),
    });
  }

  await batch.commit();
}

// Helper function to randomly select images
function getRandomImages(images, count) {
  const shuffled = [...images].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Update the addPackToUser function to handle multiple series
export async function addPackToUser(userId, series) {
  const userRef = doc(db, 'users', userId);
  const imagesSnapshot = await getDocs(collection(db, 'images'));
  const availableImages = imagesSnapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    .filter(img => series.includes(img.series));

  if (availableImages.length < 5) {
    throw new Error('Not enough images in selected series');
  }

  const randomImages = getRandomImages(availableImages, 5);

  await updateDoc(userRef, {
    currentPack: {
      images: randomImages,
      series,
      openedAt: Timestamp.now(),
    },
    pendingPacks: increment(1),
  });
}

export async function getAllUsers() {
  const usersCollection = collection(db, 'users');
  const snapshot = await getDocs(usersCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
} 