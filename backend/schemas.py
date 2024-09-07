from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    team_id: Optional[int] = None

    class Config:
        orm_mode = True

class TeamBase(BaseModel):
    name: str

class TeamCreate(TeamBase):
    leader_id: int

class TeamUpdate(TeamBase):
    leader_id: Optional[int] = None

class Team(TeamBase):
    id: int
    leader_id: int
    members: list[User] = []

    class Config:
        orm_mode = True

class MetricBase(BaseModel):
    name: str
    value: float

class MetricCreate(MetricBase):
    team_id: int

class Metric(MetricBase):
    id: int
    timestamp: datetime
    team_id: int

    class Config:
        orm_mode = True