from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

# Import db from user model to use the same instance
from src.models.user import db

class InspectionRecord(db.Model):
    __tablename__ = 'inspection_records'
    
    id = db.Column(db.String(36), primary_key=True)
    serial_number = db.Column(db.String(100), unique=True, nullable=False)
    basic_data = db.Column(db.Text, nullable=False)  # JSON string
    inspection_results = db.Column(db.Text, nullable=False)  # JSON string
    recommendations = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.String(100), nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with attachments
    attachments = db.relationship('Attachment', backref='record', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'serialNumber': self.serial_number,
            'basicData': json.loads(self.basic_data) if self.basic_data else {},
            'inspectionResults': json.loads(self.inspection_results) if self.inspection_results else {},
            'recommendations': self.recommendations,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'createdBy': self.created_by,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

class Attachment(db.Model):
    __tablename__ = 'attachments'
    
    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    content_type = db.Column(db.String(100), nullable=False)
    size = db.Column(db.Integer, nullable=False)
    record_id = db.Column(db.String(36), db.ForeignKey('inspection_records.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'filePath': self.file_path,
            'contentType': self.content_type,
            'size': self.size,
            'recordId': self.record_id,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.String(36), primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), default='info')
    user_id = db.Column(db.String(36), nullable=False)
    record_id = db.Column(db.String(36), db.ForeignKey('inspection_records.id'), nullable=True)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'userId': self.user_id,
            'recordId': self.record_id,
            'isRead': self.is_read,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

