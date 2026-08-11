import './globals.css';
import { AuthProvider } from '../lib/authContext';
import { ThemeProvider } from '../lib/themeContext';

export const metadata = {
  title: 'Attendance & Payroll System',
  description: 'Enterprise QR-based Attendance and Automated Payroll Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
