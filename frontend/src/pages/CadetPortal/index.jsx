// CadetPortal is no longer used as the primary entry point.
// Cadets now join directly from the Login page via the "Cadet Entry" tab.
// This file is kept as a redirect fallback.

import { Navigate } from 'react-router-dom';

export default function CadetPortal() {
  return <Navigate to="/" replace />;
}
