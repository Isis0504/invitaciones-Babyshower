import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  CalendarDays,
  Clock3,
  MapPin,
  Play,
  Sparkles,
  VolumeX,
} from 'lucide-react';
import { configuracion, invitados } from './configuracion.js';
import './styles.css';

const ultimaEscena = 5;
const regalosGenericos = [
  'Pañales talla RN',
  'Toallitas húmedas',
  'Productos esenciales para bebé',
];
const mensajeWhatsApp =
  'Hola, queremos confirmar nuestra asistencia al Baby Shower. ¡Nos encantará acompañarlos en este día tan especial! ✨🦋';

function getInvitado() {
  const segments = window.location.pathname.split('/').filter(Boolean);
  const key = segments[0] === 'invitacion' ? segments[1]?.toLowerCase() : undefined;
  return key && invitados[key]
    ? invitados[key]
    : { nombre: 'invitado especial', regalos: regalosGenericos };
}

function crearUrlWhatsApp() {
  const phone = configuracion.telefonoWhatsApp.replace(/\D/g, '');
  const url = new URL(phone ? `https://wa.me/${phone}` : 'https://wa.me/');
  url.searchParams.set('text', mensajeWhatsApp);
  return url.toString();
}

function App() {
  const invitado = useMemo(getInvitado, []);
  const [escena, setEscena] = useState(0);
  const [transicion, setTransicion] = useState(null);
  const [audioReproduciendo, setAudioReproduciendo] = useState(false);
  const [errorAudio, setErrorAudio] = useState('');
  const audioRef = useRef(null);
  const reducirMovimiento = useReducedMotion();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.play()
      .then(() => setAudioReproduciendo(true))
      .catch((error) => {
        if (error.name !== 'NotAllowedError') {
          console.error('No se pudo reproducir la canción de fondo.', error);
          setErrorAudio('No se pudo reproducir la canción. Revisa el archivo de audio.');
        }
      });
  }, []);

  const reproducirAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
      setAudioReproduciendo(true);
      setErrorAudio('');
    } catch (error) {
      console.error('No se pudo reproducir la canción de fondo.', error);
      setAudioReproduciendo(false);
      setErrorAudio('No se pudo reproducir la canción. Revisa el archivo de audio.');
    }
  };

  const alternarAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      void reproducirAudio();
    } else {
      audio.pause();
      setAudioReproduciendo(false);
      setErrorAudio('');
    }
  };

  const comenzarHistoria = () => {
    void reproducirAudio();
    avanzar();
  };

  const cambiarEscena = (siguiente) => {
    if (siguiente === escena) return;
    setTransicion({
      id: `${escena}-${siguiente}-${Date.now()}`,
    });
    setEscena(siguiente);
  };
  const avanzar = () => cambiarEscena(Math.min(escena + 1, ultimaEscena));

  return (
    <main className={`invitation-shell scene-bg-${escena}${escena === 0 ? ' cover-active' : ''}`}>
      {escena > 0 && <ForestBackground />}

      <AnimatePresence mode="wait">
        <motion.section
          key={escena}
          className={`scene${escena >= 1 && escena <= 5 ? ' scene-artwork' : ''}`}
          initial={{ opacity: 0, y: reducirMovimiento ? 0 : 12, scale: reducirMovimiento ? 1 : 0.985 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reducirMovimiento ? 0 : -8, scale: reducirMovimiento ? 1 : 1.01 }}
          transition={{ duration: reducirMovimiento ? 0.15 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          aria-live="polite"
        >
          {escena === 0 && <Cover onNext={comenzarHistoria} />}
          {escena === 1 && <Adhara onNext={avanzar} />}
          {escena === 2 && (
            <Invitation
              names={invitado.nombres || invitado.nombre}
              onNext={avanzar}
            />
          )}
          {escena === 3 && <Details onNext={avanzar} />}
          {escena === 4 && <GiftDetail gifts={invitado.regalos} onNext={avanzar} />}
          {escena === 5 && <Confirmation confirmUrl={crearUrlWhatsApp()} />}
        </motion.section>
      </AnimatePresence>

      <AnimatePresence>
        {transicion && (
          <SceneTransition
            key={transicion.id}
            transition={transicion}
            reduceMotion={reducirMovimiento}
            setTransition={setTransicion}
          />
        )}
      </AnimatePresence>

      {configuracion.audioFondo && (
        <>
          <audio
            ref={audioRef}
            src={configuracion.audioFondo}
            loop
            preload="none"
            onError={() => {
              setAudioReproduciendo(false);
              setErrorAudio('No se encontró la canción. Revisa el archivo de audio.');
            }}
          />
          <div className="music-control">
            <button
              className="music-toggle"
              type="button"
              onClick={alternarAudio}
              aria-label={audioReproduciendo ? 'Pausar música' : 'Reproducir música'}
              aria-pressed={audioReproduciendo}
              title={audioReproduciendo ? 'Silenciar música' : 'Reproducir música'}
            >
              {audioReproduciendo
                ? <VolumeX size={16} aria-hidden="true" />
                : <Play size={16} aria-hidden="true" />}
            </button>
            {errorAudio && <p className="music-error" role="status">{errorAudio}</p>}
          </div>
        </>
      )}

      {escena > 0 && <p className="page-note">Una invitación para celebrar con amor</p>}
    </main>
  );
}

function ForestBackground() {
  return (
    <div className="forest" aria-hidden="true">
      <div className="forest-artwork" />
      <div className="fireflies">
        {Array.from({ length: 22 }, (_, index) => (
          <span
            key={index}
            className="firefly"
            style={{
              '--x': `${(index * 47 + 9) % 97}%`,
              '--y': `${(index * 31 + 12) % 75}%`,
              '--delay': `${-(index % 9) * 0.6}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SceneTransition({ transition, reduceMotion, setTransition }) {
  const duration = 1.15;
  React.useEffect(() => {
    const timer = window.setTimeout(
      () => setTransition((current) => current?.id === transition.id ? null : current),
      reduceMotion ? 300 : 1500,
    );
    return () => window.clearTimeout(timer);
  }, [reduceMotion, setTransition, transition.id]);

  if (reduceMotion) return null;
  return (
    <motion.div
      className="scene-transition transition-sparkles"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      aria-hidden="true"
    >
      <motion.div
        className="magic-particles particles-sparkles"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.9, 0] }}
        transition={{ duration, times: [0, 0.25, 0.7, 1], ease: 'easeInOut' }}
      >
        {Array.from({ length: 18 }, (_, index) => (
          <motion.span
            key={index}
            className="transition-star"
            style={{ '--particle-x': `${(index * 53 + 12) % 94}%`, '--particle-y': `${(index * 37 + 7) % 88}%` }}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: [0, 1, 0.7], rotate: [0, 65, 130], y: [12, -18, -42] }}
            transition={{ duration: duration * 0.9, delay: index * 0.025, ease: 'easeOut' }}
          >✦</motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
}

function Cover({ onNext }) {
  const continueFromKeyboard = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onNext();
    }
  };

  return (
    <div
      className="cover-screen"
      role="button"
      tabIndex={0}
      onClick={onNext}
      onKeyDown={continueFromKeyboard}
      aria-label="Toca el sobre para continuar esta historia"
    >
      <img className="cover-background" src="/illustrations/Fondob.png" alt="" />
      <div className="cover-stage">
        <h1 className="cover-title">Érase una vez...</h1>
        <p className="cover-intro">
          En un pequeño rincón de un bosque encantado, una historia muy especial estaba a punto de comenzar.
        </p>
        <img className="cover-fairy" src="/illustrations/hada.png" alt="" />
        <img className="cover-envelope" src="/illustrations/sobre.png" alt="" />
        <p className="cover-instruction">Toca el sobre para continuar esta historia...</p>
      </div>
      <span className="cover-sparkles" aria-hidden="true">
        {Array.from({ length: 24 }, (_, index) => (
          <span
            key={index}
            className="cover-sparkle"
            style={{
              '--x': `${(index * 47 + 11) % 96}%`,
              '--y': `${(index * 31 + 7) % 92}%`,
              '--delay': `${-(index % 8) * 0.55}s`,
              '--duration': `${2.1 + (index % 5) * 0.42}s`,
            }}
          />
        ))}
      </span>
    </div>
  );
}

function Adhara({ onNext }) {
  return (
    <section className="storybook-canvas storybook-scene-two" aria-label="Nuestra pequeña hadita">
      <img className="storybook-frame" src="/illustrations/cuadrotexto.png" alt="" />
      <img className="storybook-fairy" src="/illustrations/Hada2.png" alt="" />
      <h1 className="storybook-title scene-two-title">Entre flores,<br />estrellas y<br />destellos de magia...</h1>
      <p className="scene-two-copy">
        Una dulce hadita comenzó<br />
        a llenar de amor los corazones<br />
        de quienes esperan conocerla.
      </p>
      <p className="scene-two-closing">Nuestra pequeña<br />Hadita del Bosque.</p>
      <StorybookMagic />
      <StoryNext onNext={onNext} label="Continuar el cuento" />
    </section>
  );
}

function Invitation({ names, onNext }) {
  return (
    <section className="storybook-canvas storybook-scene-three" aria-label="Invitación al Baby Shower">
      <h1 className={`storybook-title scene-three-title${names.length > 20 ? ' scene-three-title-long' : ''}`}>
        Queridos/as {names}
      </h1>
      <p className="scene-three-copy">
        Queremos invitarte a<br />
        compartir con nosotros una<br />
        tarde llena de magia, amor,<br />
        dulzura y momentos<br />
        inolvidables.
      </p>
      <p className="scene-three-ribbon">Una tarde para celebrar<br />una nueva historia</p>
      <img className="storybook-deer" src="/illustrations/siervos.png" alt="" />
      <StorybookMagic />
      <StoryNext onNext={onNext} label="Descubrir los detalles" />
    </section>
  );
}

function Details({ onNext }) {
  return (
    <section className="storybook-canvas storybook-scene-four" aria-label="Fecha, hora y lugar">
      <h1 className="storybook-title scene-four-title">El gran día</h1>
      <Countdown />
      <div className="scene-four-details">
        <Detail icon={<CalendarDays />} label="Fecha" value={configuracion.fecha} />
        <Detail icon={<Clock3 />} label="Hora" value={configuracion.hora} />
        <Detail icon={<MapPin />} label="Lugar" value={configuracion.lugar} />
      </div>
      <p className="scene-four-closing">
        ¡Te esperamos para celebrar juntos la llegada<br />
        de nuestra pequeña hadita!
      </p>
      <img className="storybook-house" src="/illustrations/casah.png" alt="" />
      <StorybookMagic />
      <StoryNext onNext={onNext} label="Continuar" />
    </section>
  );
}

function Countdown() {
  const [now, setNow] = useState(() => Date.now());
  const eventTime = new Date(configuracion.fechaEvento).getTime();
  const timeLeft = Math.max(eventTime - now, 0);
  const units = [
    { label: 'días', value: Math.floor(timeLeft / 86_400_000) },
    { label: 'horas', value: Math.floor((timeLeft / 3_600_000) % 24) },
    { label: 'minutos', value: Math.floor((timeLeft / 60_000) % 60) },
    { label: 'segundos', value: Math.floor((timeLeft / 1_000) % 60) },
  ];

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      className="scene-four-countdown"
      role="timer"
      aria-label="Cuenta regresiva hasta el 12 de diciembre"
    >
      <p className="scene-four-countdown-heading">
        {timeLeft > 0 ? 'Tan solo falta...' : '¡El gran día llegó!'}
      </p>
      {timeLeft > 0 && (
        <div className="scene-four-countdown-units">
          {units.map(({ label, value }) => (
            <div className="scene-four-countdown-unit" key={label}>
              <span className="scene-four-countdown-value">{String(value).padStart(2, '0')}</span>
              <span className="scene-four-countdown-label">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StoryNext({ onNext, label }) {
  return (
    <button className="storybook-next" type="button" onClick={onNext}>
      {label}<Sparkles size={14} aria-hidden="true" />
    </button>
  );
}

function StorybookMagic() {
  return (
    <div className="storybook-magic" aria-hidden="true">
      <span className="storybook-butterfly butterfly-left">🦋</span>
      <span className="storybook-butterfly butterfly-right">🦋</span>
      {Array.from({ length: 10 }, (_, index) => (
        <span
          key={index}
          className="storybook-twinkle"
          style={{
            '--x': `${(index * 37 + 8) % 90}%`,
            '--y': `${(index * 43 + 13) % 82}%`,
            '--delay': `${-(index % 6) * 0.6}s`,
          }}
        >
          {index % 3 === 0 ? '✦' : '✧'}
        </span>
      ))}
    </div>
  );
}

function Detail({ icon, label, value }) {
  return (
    <div className="detail-row">
      <span className="detail-icon" aria-hidden="true">{icon}</span>
      <div><span className="detail-label">{label}</span><strong>{value}</strong></div>
    </div>
  );
}

function GiftDetail({ gifts, onNext }) {
  return (
    <section className="storybook-canvas storybook-scene-five" aria-label="Detalles de regalos para Adhara">
      <img className="storybook-gift-fairy gift-fairy-top" src="/illustrations/hada5.png" alt="" />
      <h1 className="storybook-title scene-five-title">
        <span aria-hidden="true">🎁</span> Tu lindo detalle<span aria-hidden="true">♥</span>
      </h1>
      <p className="scene-five-message">
        Tu presencia es nuestro mejor regalo.<br />
        Sin embargo, agradecemos mucho que nos trajeras estos lindos detalles que serán de gran ayuda para sus primeros días:
      </p>
      <ul className="scene-five-gifts">
        {gifts.map((gift) => (
          <li key={gift}><span aria-hidden="true">♥</span>{gift}</li>
        ))}
      </ul>
      <div className="scene-five-flourish closing-flourish" aria-hidden="true"><span />♥<span /></div>
      <p className="scene-five-thanks">
        ¡Gracias por ser parte de este<br />
        momento tan especial! ♡
      </p>
      <StorybookMagic />
      <StoryNext onNext={onNext} label="Continuar" />
    </section>
  );
}

function Confirmation({ confirmUrl }) {
  return (
    <section className="storybook-canvas storybook-scene-six" aria-label="Confirmación de asistencia">
      <div className="scene-six-flourish scene-six-top-flourish" aria-hidden="true"><span />♡<span /></div>
      <h1 className="scene-six-heading">¿Nos acompañas en esta historia?</h1>
      <p className="scene-six-message">
        Tu presencia hará que este día sea<br />
        aún más especial.
      </p>
      <p className="scene-six-invitation">
        Nos encantaría compartir contigo la<br />
        llegada de nuestra pequeña hadita.
      </p>
      <a
        className="scene-six-confirm"
        href={confirmUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Confirmar mi asistencia por WhatsApp"
      >
        <img src="/illustrations/botonse-transparente.png" alt="" />
      </a>
      <p className="scene-six-closing">
        Y así comienza la historia de una<br />
        pequeña hadita que llegó para hacer<br />
        nuestro mundo mucho más bonito.
      </p>
      <div className="scene-six-flourish scene-six-bottom-flourish" aria-hidden="true"><span />♡<span /></div>
      <StorybookMagic />
    </section>
  );
}

createRoot(document.getElementById('root')).render(<App />);
