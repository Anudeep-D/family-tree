import React from 'react';
import { useParams } from 'react-router-dom';

const Tree: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div style={{ padding: '20px' }}>
      <h2>Project ID from URL:</h2>
      <p>{id}</p>
    </div>
  );
};

export default Tree;