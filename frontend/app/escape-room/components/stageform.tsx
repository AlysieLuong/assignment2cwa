'use client';

import React from 'react';
import styles from './stageform.module.css';

interface StageFormProps {
  roomName: string;
  setRoomName: (name: string) => void;
  backgroundImage: string;
  handleBackgroundUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  solution: string;
  setSolution: (solution: string) => void;
  stageImage: string;
  setStageImage: (image: string) => void;
  timerMinutes: number;
  setTimerMinutes: (minutes: number) => void;
  addStage: () => void;
}

export default function StageForm({
  roomName,
  setRoomName,
  backgroundImage,
  handleBackgroundUpload,
  title,
  setTitle,
  description,
  setDescription,
  solution,
  setSolution,
  stageImage,
  setStageImage,
  timerMinutes,
  setTimerMinutes,
  addStage,
}: StageFormProps) {
  const handleStageImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setStageImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Room Name</label>
        <input
          type="text"
          placeholder="Enter room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Timer (minutes)</label>
        <input
          type="number"
          value={timerMinutes}
          onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 0)}
          min="1"
          className={styles.input}
        />
      </div>

      <hr className={styles.divider} />

      <h3 className={styles.sectionTitle}>Add Stage</h3>

      <input
        type="text"
        placeholder="Stage Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={styles.input}
      />

      <textarea
        placeholder="Stage Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className={styles.textarea}
      />

      <textarea
        placeholder="Solution Code"
        value={solution}
        onChange={(e) => setSolution(e.target.value)}
        rows={4}
        className={styles.textarea}
      />

      <div className={styles.formGroup}>
        <label className={styles.label}>Stage Image (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleStageImageUpload}
          className={styles.fileInput}
        />
        {stageImage && (
          <p className={styles.uploadSuccess}>✓ Stage image uploaded</p>
        )}
      </div>

      <button onClick={addStage} className={styles.addButton}>
        + Add Stage
      </button>
    </div>
  );
}