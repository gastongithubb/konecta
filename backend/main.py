# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from fastapi import File, UploadFile
import csv
import io
from fastapi.security import OAuth2PasswordRequestForm
from auth import authenticate_user, create_access_token, get_current_user


models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Health Metrics API"}

@app.get("/teams")
async def read_teams(db: Session = Depends(get_db)):
    teams = db.query(models.Team).all()
    return teams

@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    buffer = io.StringIO(contents.decode('utf-8'))
    csvreader = csv.DictReader(buffer)
    
    for row in csvreader:
        # Aquí procesarías cada fila del CSV y la guardarías en la base de datos
        # Por ejemplo:
        metric = models.Metric(
            name=row['metric_name'],
            value=float(row['metric_value']),
            team_id=int(row['team_id'])
        )
        db.add(metric)
    
    db.commit()
    return {"message": "CSV processed successfully"}

@app.get("/metrics")
async def read_metrics(db: Session = Depends(get_db)):
    metrics = db.query(models.Metric).all()
    return metrics

@app.get("/teams/{team_id}/metrics")
async def read_team_metrics(team_id: int, db: Session = Depends(get_db)):
    metrics = db.query(models.Metric).filter(models.Metric.team_id == team_id).all()
    return metrics

@app.post("/teams")
async def create_team(name: str, leader_id: int, db: Session = Depends(get_db)):
    team = models.Team(name=name, leader_id=leader_id)
    db.add(team)
    db.commit()
    db.refresh(team)
    return team

@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me")
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user