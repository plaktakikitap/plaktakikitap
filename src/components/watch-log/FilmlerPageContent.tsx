"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FavoriteVitrinFilms, type FilmItem } from "./FavoriteVitrinFilms";
import { WatchLogFilterableSection } from "./WatchLogFilterableSection";
import { FilmDetailModal } from "./FilmDetailModal";

interface FilmlerPageContentProps {
  films: FilmItem[];
  favoriteFilms: FilmItem[];
}

export function FilmlerPageContent({ films, favoriteFilms }: FilmlerPageContentProps) {
  const [selectedFilm, setSelectedFilm] = useState<FilmItem | null>(null);

  return (
    <>
      <FavoriteVitrinFilms films={favoriteFilms} onSelectFilm={setSelectedFilm} />
      <WatchLogFilterableSection films={films} onSelectFilm={setSelectedFilm} />
      <AnimatePresence>
        {selectedFilm && (
          <FilmDetailModal
            key={selectedFilm.id}
            item={selectedFilm}
            onClose={() => setSelectedFilm(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
