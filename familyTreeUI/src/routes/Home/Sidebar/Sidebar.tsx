import { Paper, Typography, Box } from '@mui/material';

const nodeTypes = ['Person', 'House'];

export const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Paper elevation={3} sx={{ width: 200, p: 2, m: 1 }}>
      <Typography variant="h6" gutterBottom>
        Add Nodes
      </Typography>
      {nodeTypes.map((type) => (
        <Box
          key={type}
          draggable
          onDragStart={(event) => onDragStart(event, type)}
          sx={{
            border: '1px dashed #aaa',
            borderRadius: 1,
            p: 1,
            mb: 1,
            cursor: 'grab',
            bgcolor: '#f9f9f9',
            '&:hover': {
              bgcolor: '#ececec',
            },
          }}
        >
          {type} Node
        </Box>
      ))}
    </Paper>
  );
};
