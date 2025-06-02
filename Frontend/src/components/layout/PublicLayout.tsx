import { Outlet, useLocation } from 'react-router-dom';

import { PublicHeader } from './PublicHeader';


export default function PublicLayout() {
  const location = useLocation();
  const isApplyPath = location.pathname === '/apply';

  return (
    
    <div className='h-screen w-screen'>
      <PublicHeader/>
      <Outlet/>
    </div>
  );
}