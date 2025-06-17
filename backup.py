import os
import json
import shutil
from datetime import datetime
from flask import Blueprint, jsonify, request, send_file
from src.models.user import db

backup_bp = Blueprint('backup', __name__)

@backup_bp.route('/backup', methods=['POST'])
def create_backup():
    """Create a backup of the SQLite database"""
    try:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_filename = f'pharmacy_backup_{timestamp}.db'
        
        # Get the database path
        db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'app.db')
        backup_path = f'/tmp/{backup_filename}'
        
        # Create backup by copying the SQLite file
        if os.path.exists(db_path):
            shutil.copy2(db_path, backup_path)
            
            return jsonify({
                'success': True,
                'message': 'Backup created successfully',
                'filename': backup_filename,
                'path': backup_path,
                'size': os.path.getsize(backup_path)
            })
        else:
            return jsonify({
                'success': False,
                'message': f'Database file not found at: {db_path}'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Backup error: {str(e)}'
        }), 500

@backup_bp.route('/backup/download/<filename>', methods=['GET'])
def download_backup(filename):
    """Download a backup file"""
    try:
        backup_path = f'/tmp/{filename}'
        if os.path.exists(backup_path):
            return send_file(backup_path, as_attachment=True, download_name=filename)
        else:
            return jsonify({
                'success': False,
                'message': 'Backup file not found'
            }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Download error: {str(e)}'
        }), 500

@backup_bp.route('/backup/restore', methods=['POST'])
def restore_backup():
    """Restore database from backup"""
    try:
        data = request.get_json()
        filename = data.get('filename')
        
        if not filename:
            return jsonify({
                'success': False,
                'message': 'Filename is required'
            }), 400
            
        backup_path = f'/tmp/{filename}'
        db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'app.db')
        
        if os.path.exists(backup_path):
            # Create backup of current database
            current_backup = f'{db_path}.backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
            if os.path.exists(db_path):
                shutil.copy2(db_path, current_backup)
            
            # Restore from backup
            shutil.copy2(backup_path, db_path)
            
            return jsonify({
                'success': True,
                'message': 'Database restored successfully',
                'current_backup': os.path.basename(current_backup)
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Backup file not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Restore error: {str(e)}'
        }), 500

@backup_bp.route('/backup/status', methods=['GET'])
def backup_status():
    """Get backup status and list available backups"""
    try:
        backup_dir = '/tmp'
        backup_files = []
        
        for filename in os.listdir(backup_dir):
            if filename.startswith('pharmacy_backup_') and filename.endswith('.db'):
                filepath = os.path.join(backup_dir, filename)
                stat = os.stat(filepath)
                backup_files.append({
                    'filename': filename,
                    'size': stat.st_size,
                    'created': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                    'download_url': f'/api/backup/download/{filename}'
                })
        
        # Get current database info
        db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'app.db')
        db_info = None
        if os.path.exists(db_path):
            stat = os.stat(db_path)
            db_info = {
                'size': stat.st_size,
                'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                'path': db_path
            }
        
        return jsonify({
            'success': True,
            'database': db_info,
            'backups': sorted(backup_files, key=lambda x: x['created'], reverse=True)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Status error: {str(e)}'
        }), 500

