from sqlalchemy.orm import Session
import models
from fastapi import HTTPException
from passlib.context import CryptContext
from pydantic import BaseModel

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserResponse(BaseModel):
    email: str
    username: str

    class Config:
        orm_mode = True

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, username: str, email: str, password: str):
    # Check if user already exists
    if get_user_by_email(db, email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if get_user_by_username(db, username):
        raise HTTPException(status_code=400, detail="Username already taken")
    
    hashed_password = pwd_context.hash(password)
    db_user = models.User(
        username=username,
        email=email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Return user data in the correct format
    return UserResponse(
        email=db_user.email,
        username=db_user.username
    )

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not pwd_context.verify(password, user.hashed_password):
        return False
    return user

def create_card(db: Session, card: dict, owner_id: int):
    db_card = models.Card(**card, owner_id=owner_id)
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card

def get_user_cards(db: Session, user_id: int):
    return db.query(models.Card).filter(models.Card.owner_id == user_id).all()

def get_card(db: Session, card_id: int):
    return db.query(models.Card).filter(models.Card.id == card_id).first() 