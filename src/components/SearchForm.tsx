'use client';
import { FormEvent, useMemo, useState } from 'react';
import { municipalities } from '@/lib/municipalities';

export default function SearchForm() {
  const [destination, setDestination] = useState('');
  const [destinationOpen, setDestinationOpen] = useState(false);
  const today = new Date();
  const plus = (days: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  const [checkin, setCheckin] = useState(plus(14));
  const [checkout, setCheckout] = useState(plus(17));
  const [guests, setGuests] = useState('2');
  const filteredMunicipalities = useMemo(() => {
    const query = destination.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-PT');
    if (!query) return municipalities;
    return municipalities.filter((city) => city.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-PT').includes(query));
  }, [destination]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams({ destination: destination.trim(), checkin, checkout, guests });
    window.location.href = `/search?${params.toString()}`;
  }

  return (
    <form className="search-form" onSubmit={submit}>
      <label className="destination-field">
        <span>Para onde?</span>
        <input value={destination} onChange={(event) => { setDestination(event.target.value); setDestinationOpen(true); }} onFocus={() => setDestinationOpen(true)} onBlur={() => setTimeout(() => setDestinationOpen(false), 140)} placeholder="Cidade ou município em Portugal" autoComplete="off" aria-label="Cidade ou município em Portugal" />
        {destinationOpen && <div className="destination-options" role="listbox" aria-label="Municípios de Portugal">
          <div className="destination-options-heading">{filteredMunicipalities.length} municípios disponíveis</div>
          {filteredMunicipalities.length ? filteredMunicipalities.map((city) => <button key={city} type="button" role="option" aria-selected={destination === city} onMouseDown={(event) => event.preventDefault()} onClick={() => { setDestination(city); setDestinationOpen(false); }}>{city}</button>) : <div className="destination-no-results">Nenhum município encontrado. Pode pesquisar por uma região ou localidade.</div>}
        </div>}
      </label>
      <label><span>Check-in</span><input type="date" value={checkin} min={plus(0)} onChange={(event) => { setCheckin(event.target.value); if (checkout <= event.target.value) { const date = new Date(`${event.target.value}T12:00:00`); date.setDate(date.getDate() + 1); setCheckout(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`); } }} required /></label>
      <label><span>Check-out</span><input type="date" value={checkout} min={checkin} onChange={(event) => setCheckout(event.target.value)} required /></label>
      <label><span>Hóspedes</span><select value={guests} onChange={(event) => setGuests(event.target.value)}>{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => <option key={count} value={count}>{count} {count === 1 ? 'hóspede' : 'hóspedes'}</option>)}</select></label>
      <button className="button button-primary" type="submit">Pesquisar</button>
    </form>
  );
}
