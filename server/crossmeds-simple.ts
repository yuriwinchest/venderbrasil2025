import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

// Serve CrossMeds HTML directly
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'crossmeds-mobile-app.html'));
});

// Catch all routes to serve CrossMeds
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'crossmeds-mobile-app.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏥 CrossMeds running on http://localhost:${PORT}`);
  console.log('✅ Sistema médico funcionando perfeitamente!');
});