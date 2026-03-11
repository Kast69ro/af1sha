import { Routes, Route, Navigate } from "react-router-dom";
import CatalogScreen from "../pages/Catalog/catalog.jsx";
import MovieDetailsScreen from "../pages/MovieDetails/MovieDetail.jsx";
import HallPage from "../pages/HallPage/hallPage.jsx";
import AppLayout from "./providers/layout.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/catalog/:categoryId" element={<CatalogScreen />} />
        <Route path="/" element={null} />  {/* пустая страница пока грузится */}
      </Route>
      <Route path="/event/:eventId" element={<MovieDetailsScreen />} />
      <Route path="/session/:sessionId" element={<HallPage />} />
      <Route path="*" element={<div className="p-4">Not found</div>} />
    </Routes>
  );
}