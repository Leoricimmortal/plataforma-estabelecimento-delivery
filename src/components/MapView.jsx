// Mapa de acompanhamento (Leaflet + OpenStreetMap) com loja, entregador e cliente.
// Em produção, troque os blocos do OpenStreetMap por um provedor com chave (Google Maps, Mapbox, MapTiler).
import { useEffect, useMemo, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import Icon from './Icon';
import ErrorBoundary from './ErrorBoundary';
import { useApp } from '../store/useApp';
import { LOJA_POS, gmapsUrl, wazeUrl } from '../lib/geo';
import { posEntregador, destOf, etaText } from '../domain/pedidos';

const pin = (cls, icon) => L.divIcon({ className: '', html: `<span class="mk ${cls}">${renderToStaticMarkup(<Icon name={icon} />)}</span>`, iconSize: [34, 34], iconAnchor: [17, 17] });
const PINS = { store: pin('mk-store', 'store'), dest: pin('mk-dest', 'home'), drv: pin('mk-drv', 'bike') };

function Enquadrar({ pts }) {
  const map = useMap();
  // Enquadra uma vez ao abrir (não a cada atualização, para não brigar com o zoom do usuário).
  useEffect(() => {
    const t = setTimeout(() => {
      if (!map.getContainer()?.isConnected) return; // o mapa já saiu da tela
      map.invalidateSize({ animate: false });
      map.fitBounds(L.latLngBounds(pts).pad(0.35), { maxZoom: 16, animate: false });
    }, 60);
    return () => clearTimeout(t);
  }, []);
  return null;
}

/** Mapa protegido: se o Leaflet falhar, mostra só o aviso em vez de quebrar a tela. */
export default function MapView(props) {
  return <ErrorBoundary fallback={<div className="mapbox no-tiles"><div className="map-note"><Icon name="map" /> Não foi possível mostrar o mapa agora.</div></div>}><Mapa {...props} /></ErrorBoundary>;
}

function Mapa({ num, height = 250 }) {
  const p = useApp((s) => s.pedidos.find((x) => x.num == num));
  const now = useApp((s) => s.now);
  const [semRuas, setSemRuas] = useState(false);
  const pos = p ? posEntregador(p, now) : null;
  const rota = p?.status === 'rota';
  const alvo = rota ? destOf(p) : LOJA_POS;
  const pts = useMemo(() => (pos ? [LOJA_POS, pos, ...(rota ? [destOf(p)] : [])] : [LOJA_POS]), [!!pos, rota]);
  // links atualizados a cada ~10 s para não "piscar"
  const linkPos = useMemo(() => pos, [Math.floor(now / 10000), !!pos]);
  if (!p || !pos) return null;
  return (
    <div className={`mapbox ${semRuas ? 'no-tiles' : ''}`}>
      <div className="lmap" style={{ height }} role="img" aria-label="Mapa com a posição do entregador">
        <MapContainer center={LOJA_POS} zoom={14} scrollWheelZoom={false} zoomSnap={0.5} style={{ height: '100%' }} attributionControl>
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} attribution="&copy; OpenStreetMap"
            eventHandlers={{ tileload: () => setSemRuas(false), tileerror: () => setSemRuas(true) }}
          />
          <Marker position={LOJA_POS} icon={PINS.store} title="Sua loja" />
          {rota && <Marker position={destOf(p)} icon={PINS.dest} title="Cliente" />}
          <Marker position={pos} icon={PINS.drv} title="Entregador" zIndexOffset={500} />
          <Polyline positions={[pos, alvo]} pathOptions={{ color: '#2f7bf5', weight: 4, dashArray: '8 8', opacity: 0.85 }} />
          <Enquadrar pts={pts} />
        </MapContainer>
      </div>
      <div className="map-note"><Icon name="map" /> Ruas do mapa indisponíveis agora. As posições continuam corretas; use os botões abaixo para ver no Google Maps.</div>
      <div className="map-foot">
        <span className="map-eta">{etaText(p, now)}</span>
        <span className="map-leg"><i className="lg-store" />Loja{rota && <><i className="lg-dest" />Cliente</>}<i className="lg-drv" />Entregador</span>
        <span className="map-links">
          <a className="btn btn-outline btn-sm" href={gmapsUrl(linkPos || pos, alvo)} target="_blank" rel="noopener noreferrer"><Icon name="map-pinned" /> Google Maps</a>
          <a className="btn btn-outline btn-sm" href={wazeUrl(alvo)} target="_blank" rel="noopener noreferrer"><Icon name="navigation" /> Waze</a>
        </span>
      </div>
    </div>
  );
}
