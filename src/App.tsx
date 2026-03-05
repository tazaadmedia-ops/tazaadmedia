import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';

const Home = lazy(() => import('./pages/Home'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const AuthorPage = lazy(() => import('./pages/Author'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ArticleEditor = lazy(() => import('./pages/admin/ArticleEditor'));
const Authors = lazy(() => import('./pages/admin/Authors'));
const Categories = lazy(() => import('./pages/admin/Categories'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const About = lazy(() => import('./pages/About'));
const Submit = lazy(() => import('./pages/Submit'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Sitemap = lazy(() => import('./pages/Sitemap'));
const LiveArticlePage = lazy(() => import('./pages/LiveArticlePage'));
const LoginPage = lazy(() => import('./pages/Login'));

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Auth Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes - Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/authors" element={<Authors />} />
            <Route path="/admin/categories" element={<Categories />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/edit/:id" element={<ArticleEditor />} />
            <Route path="/admin/new" element={<ArticleEditor />} />
          </Route>

          {/* Public Routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/article/:slug" element={<Layout><ArticlePage /></Layout>} />
          <Route path="/article/live/:slug" element={<Layout><LiveArticlePage /></Layout>} />
          <Route path="/author/:username" element={<Layout><AuthorPage /></Layout>} />
          <Route path="/category/:slug" element={<Layout><CategoryPage /></Layout>} />
          <Route path="/search" element={<Layout><SearchPage /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/submit" element={<Layout><Submit /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
          <Route path="/terms" element={<Layout><Terms /></Layout>} />
          <Route path="/sitemap" element={<Layout><Sitemap /></Layout>} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
