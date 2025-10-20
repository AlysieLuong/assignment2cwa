'use client';

import React, { useState } from 'react';
import StageForm from './stageform';
import StageList from './stagelist';
import { exportHTML } from './htmlexporter';
import styles from './escaperoombuilder.module.css';
import type { Stage } from './type';

//defines the escape room builder with all the states
export default function EscapeRoomBuilder({ defaultBackground = '' }) {
  const [roomName, setRoomName] = useState('My Escape Room');
  const [backgroundImage, setBackgroundImage] = useState(defaultBackground);
  const [stages, setStages] = useState<Stage[]>([]);  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [solution, setSolution] = useState('');
  const [stageImage, setStageImage] = useState('');
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [currentUniqueId, setCurrentUniqueId] = useState<string | null>(null);
  const [savedRooms, setSavedRooms] = useState<any[]>([]);
  const [showLoadModal, setShowLoadModal] = useState(false);

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };  

  //add and delete stages
  const addStage = () => {
    if (title.trim()) {
      setStages([...stages, { title, description, solution, stageImage }]);
      setTitle('');
      setDescription('');
      setSolution('');
      setStageImage('');
    }
  };

  const deleteStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  //generate HTML download and create/update room in database
  const handleExport = () => {
    const uniqueId = currentUniqueId || new Date().toISOString().replace(/[:.]/g, '-');
    exportHTML(roomName, stages, timerMinutes, uniqueId);
  };

  const handleSave = async () => {
    const uniqueId = currentUniqueId || new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
      const method = currentUniqueId ? 'PATCH' : 'POST';
      const url = currentUniqueId 
        ? `/api/users?uid=${currentUniqueId}` 
        : '/api/users';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roomName,
          appliedImagesData: stages,   
          uniqueId,                    
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        alert(`Save failed (${res.status}): ${msg}`);
        return;
      }
      
      setCurrentUniqueId(uniqueId);
      alert(`${currentUniqueId ? 'Updated' : 'Saved'} successfully! ID: ${uniqueId}`);
    } catch (e: any) {
      alert(`Save error: ${String(e?.message || e)}`);
    }
  };

  //fetch list of saved room and load specific room by uniqueid
  const handleLoadList = async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) {
        alert(`Failed to load rooms (${res.status})`);
        return;
      }
      
      const rooms = await res.json();
      setSavedRooms(rooms);
      setShowLoadModal(true);
    } catch (e: any) {
      alert(`Load error: ${String(e?.message || e)}`);
    }
  };

  const handleLoadRoom = async (uniqueId: string) => {
    try {
      const res = await fetch(`/api/users?uid=${uniqueId}`);
      if (!res.ok) {
        alert(`Failed to load room (${res.status})`);
        return;
      }
      
      const room = await res.json();
      
      setRoomName(room.name);
      
      // Parse appliedImagesData if it's a string
      let parsedStages = room.appliedImagesData;
      if (typeof parsedStages === 'string') {
        parsedStages = JSON.parse(parsedStages);
      }
      
      setStages(parsedStages);
      setCurrentUniqueId(room.uniqueId);
      setShowLoadModal(false);
      
      alert(`Loaded room: ${room.name}`);
    } catch (e: any) {
      alert(`Load error: ${String(e?.message || e)}`);
    }
  };

  //delete currently loaded stage from database
  const handleDelete = async () => {
    if (!currentUniqueId) {
      alert('No room loaded to delete');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete "${roomName}"?`)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/users?uid=${currentUniqueId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const msg = await res.text();
        alert(`Delete failed (${res.status}): ${msg}`);
        return;
      }
      
      // Clear the form
      setRoomName('My Escape Room');
      setStages([]);
      setCurrentUniqueId(null);
      setBackgroundImage(defaultBackground);
      
      alert('Room deleted successfully!');
    } catch (e: any) {
      alert(`Delete error: ${String(e?.message || e)}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Escape Room</h1>

        {/* Form for room and stage inputs (props wire state + handlers) */}
        <StageForm
          roomName={roomName}
          setRoomName={setRoomName}
          backgroundImage={backgroundImage}
          handleBackgroundUpload={handleBackgroundUpload}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          solution={solution}
          setSolution={setSolution}
          stageImage={stageImage}
          setStageImage={setStageImage}
          timerMinutes={timerMinutes}
          setTimerMinutes={setTimerMinutes}
          addStage={addStage}
        />

        <StageList stages={stages} deleteStage={deleteStage} />

        {/* All the buttons including export, load/save/delete from Database*/}
        <button
          onClick={handleExport}
          disabled={stages.length === 0}
          className={styles.exportButton}
        >
          ↓ Export as HTML
        </button>

        <button
          onClick={handleSave}
          disabled={stages.length === 0}
          className={styles.exportButton}
        >
          Save to Database
        </button>

        <button
          onClick={handleLoadList}
          className={styles.exportButton}
        >
          Load from Database
        </button>

        <button
          onClick={handleDelete}
          disabled={!currentUniqueId}
          className={styles.exportButton}
        >
          Delete from Database
        </button>

        {/* Load Modal */}
        {showLoadModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '10px',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'auto',
              width: '90%'
            }}>
              <h2 style={{ marginTop: 0 }}>Load Escape Room</h2>
              
              {savedRooms.length === 0 ? (
                <p>No saved rooms found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {savedRooms.map((room) => (
                    <div
                      key={room.id}
                      style={{
                        padding: '15px',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onClick={() => handleLoadRoom(room.uniqueId)}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                        {room.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        ID: {room.uniqueId}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Created: {new Date(room.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <button
                onClick={() => setShowLoadModal(false)}
                style={{
                  marginTop: '20px',
                  padding: '10px 20px',
                  background: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}