'use client';

import React from 'react';
import styles from './stagelist.module.css';

interface Stage {
  title: string;
  description: string;
  solution: string;
}

interface StageListProps {
  stages: Stage[];
  deleteStage: (index: number) => void;
}

export default function StageList({ stages, deleteStage }: StageListProps) {
  return (
    <div className={styles.listContainer}>
      <h2 className={styles.heading}>Stages ({stages.length})</h2>

      {stages.length === 0 ? (
        <p className={styles.emptyMessage}>No stages yet. Add one above!</p>
      ) : (
        stages.map((stage, index) => (
          <div key={index} className={styles.stageCard}>
            <div className={styles.stageContent}>
              <p className={styles.stageTitle}>
                Stage {index + 1}: {stage.title}
              </p>
              <p className={styles.stageDescription}>{stage.description}</p>
              <p className={styles.stageSolution}>
                <strong>Solution:</strong> {stage.solution}
              </p>
            </div>
            <button
              onClick={() => deleteStage(index)}
              className={styles.deleteButton}
            >
              🗑️
            </button>
          </div>
        ))
      )}
    </div>
  );
}