import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider, createTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/Layout';
import PublicLayout from './components/layout/PublicLayout';
// import PublicLayout from './components/Layout';
import AuthLayout from './components/layout/AuthLayout';
import Home from './components/Home';
import Home1 from './components/Home1';
import Login from './components/Login';
import Register from './components/Register';
import States from './components/States';
import Regions from './components/Regions';
import Cities from './components/Cities';
import Dashboard from './components/Dashboard';
import AuthRoute from './components/AuthRoute';
import ApplyForm from './components/ApplyForm';
import Applications from './components/Applications';
import ApplicantDetails from './components/ApplicantDetails';
import About from './components/About';
import Contact from './components/Contact';
import MobileSearch from './components/MobileSearch';
import OTPVerification from './components/OTPVerification';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <Router>
            <Routes>
              {/* Redirect root to /apply/new */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              
              {/* Public Content Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/home" element={<Home />} />
                 <Route path="/home1" element={<Home1 />} />
                <Route path="/apply" element={<MobileSearch />} />
                <Route path="/apply/new" element={<ApplyForm />} />
                <Route path="/otp-verification" element={<OTPVerification />} />
                <Route path="/apply/edit/:id" element={<ApplyForm />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/home/MobileSearch" element={<MobileSearch />} />
              </Route>

              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
              
              {/* Protected Routes */}
              <Route path="/admin" element={
                <AuthRoute requireAdmin={true}>
                  <Layout />
                </AuthRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="states" element={<States />} />
                <Route path="regions" element={<Regions />} />
                <Route path="cities" element={<Cities />} />
                <Route path="applications" element={<Applications />} />
                <Route path="applicants/:id" element={
                  <AuthRoute>
                    <ApplicantDetails />
                  </AuthRoute>
                } />
              </Route>
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </LocalizationProvider>
  );
}

export default App;
