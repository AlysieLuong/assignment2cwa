'use client';

import React, { useState } from 'react';
import StageForm from './stageform';
import StageList from './stagelist';
import { exportHTML } from './htmlexporter';
import styles from './escaperoombuilder.module.css';

export default function EscapeRoomBuilder({ defaultBackground = '' }) {
  const [roomName, setRoomName] = useState('My Escape Room');
  const [backgroundImage, setBackgroundImage] = useState(defaultBackground);
  const [stages, setStages] = useState<Array<{ title: string; description: string; solution: string; stageImage: string }>>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [solution, setSolution] = useState('');
  const [stageImage, setStageImage] = useState('');
  const [timerMinutes, setTimerMinutes] = useState(30);

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

  const handleExport = () => {
    exportHTML(roomName, stages, timerMinutes);
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Escape Room</h1>

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

        <button
          onClick={handleExport}
          disabled={stages.length === 0}
          className={styles.exportButton}
        >
          ↓ Export as HTML
        </button>
      </div>
    </div>
  );
}