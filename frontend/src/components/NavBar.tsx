import { useMatches, Link, NavLink, useLocation} from 'react-router-dom';

const Breadcrumbs = () => {
  const matches = useMatches();

  const crumbs = matches
    .filter((match) => Boolean(match.handle && (match.handle as { label: string }).label))
    .map((match) => {
      return {
        label: (match.handle as { label: string }).label,
        path: match.pathname,
      };
  });

  return (
    <h2 id="breadcrumb">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <>
            {isLast ? (<p id="current-page">{crumb.label}</p>) : 
            (<Link to={crumb.path}>{crumb.label}</Link>)}
            {!isLast && (<span> / </span>)}
          </>
        );

      })}
    </h2>
  );
};

const SmartNavLink = ({ to, page}: { to: string, page: string }) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return isActive ? 
    <p id="inactive-link">{page}</p> : 
    <NavLink to={to} className="active-link">{page}</NavLink>;
};

export const NavBar = () =>(
  <header>
    <h1>CodeGuardian</h1>
    
    <Breadcrumbs />
    
    <nav>
      <SmartNavLink to="/addRepository" page="Aggiungi repository" />
      <SmartNavLink to="/repositories" page="Repositories"/>
      <SmartNavLink to="/profile" page=""/>
    </nav>
  </header>
);