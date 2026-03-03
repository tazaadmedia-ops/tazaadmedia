import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ArticlePage from './pages/ArticlePage';
import AuthorPage from './pages/Author';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import Dashboard from './pages/admin/Dashboard';
import ArticleEditor from './pages/admin/ArticleEditor';
import Authors from './pages/admin/Authors';
import Categories from './pages/admin/Categories';
import About from './pages/About';
import Submit from './pages/Submit';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/Login';
import Sitemap from './pages/Sitemap';
import LiveArticlePage from './pages/LiveArticlePage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Routes - Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/authors" element={<Authors />} />
          <Route path="/admin/categories" element={<Categories />} />
          <Route path="/admin/edit/:id" element={<ArticleEditor />} />
          <Route path="/admin/new" element={<ArticleEditor />} />
        </Route>

        {/* Public Routes */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/article/:slug" element={<Layout><ArticlePage /></Layout>} />
        <Route path="/live/:slug" element={<Layout><LiveArticlePage /></Layout>} />
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
    </Router>
  );
}

export default App;
