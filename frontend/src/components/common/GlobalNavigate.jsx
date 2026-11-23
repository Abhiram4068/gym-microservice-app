import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

let navigateRef = null;

export const globalNavigate = (to, options) => {
  if (navigateRef) {
    navigateRef(to, options);
  }
};

const GlobalNavigate = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigateRef = navigate;
  }, [navigate]);

  return null;
};

export default GlobalNavigate;
