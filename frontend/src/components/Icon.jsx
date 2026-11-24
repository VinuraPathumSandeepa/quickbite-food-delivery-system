const paths = {
  home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></>,
  menu: <><path d="M4 3v7a3 3 0 0 0 6 0V3M7 3v18M17 3v18M17 3c3 2 4 5 4 8h-4" /></>,
  cart: <><circle cx="9" cy="20" r="1" /><circle cx="19" cy="20" r="1" /><path d="M2 3h2l2.5 12h13l2-9H5" /></>,
  orders: <><rect x="4" y="4" width="16" height="17" rx="2" /><path d="M8 4.5h8M8 10h8M8 14h8" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  delivery: <><path d="M2 7h12v10H2zM14 10h4l3 3v4h-7z" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
  check: <><path d="m4 12 5 5L20 6" /></>,
  login: <><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M14 8l4 4-4 4M8 12h10" /></>,
  plus: <><path d="M12 4v16M4 12h16" /></>,
  category: <><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8" cy="9" r="1" /><path d="m4 17 5-5 4 4 3-3 4 4" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 10h18c0-2-3-3-3-10M10 21h4" /></>,
};

function Icon({ name, size = 20, className = "" }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name] || paths.dashboard}</svg>;
}

export default Icon;
