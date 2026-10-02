const markUrl = `${import.meta.env.BASE_URL}brand/emfau-mark.svg`;

export function Brand() {
  return (
    <div className="brand-lockup">
      <div className="brand-mark" data-testid="brand-mark">
        <img src={markUrl} alt="EMFAU" width="1070" height="826" />
      </div>
    </div>
  );
}
