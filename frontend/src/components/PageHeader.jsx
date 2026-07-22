import BackButton from "./BackButton";

function PageHeader({ title, subtitle, showBack = true, rightContent }) {
  return (
    <section className="page-header pro-page-header">
      <div>
        {showBack && <BackButton />}
        <p className="page-kicker">Food Delivery System</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      {rightContent && <div className="page-header-action">{rightContent}</div>}
    </section>
  );
}

export default PageHeader;