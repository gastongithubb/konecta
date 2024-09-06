# backend/models.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    leader_id = Column(Integer, ForeignKey("users.id"))

    leader = relationship("User", back_populates="team")
    members = relationship("User", back_populates="team")
    metrics = relationship("Metric", back_populates="team")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String)  # 'manager', 'leader', or 'team_member'
    team_id = Column(Integer, ForeignKey("teams.id"))

    team = relationship("Team", back_populates="members")
    led_team = relationship("Team", back_populates="leader")

class Metric(Base):
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    value = Column(Float)
    team_id = Column(Integer, ForeignKey("teams.id"))

    team = relationship("Team", back_populates="metrics")