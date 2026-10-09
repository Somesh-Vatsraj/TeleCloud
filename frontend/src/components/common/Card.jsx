export default function Card({ children, className = '', hover = true, ...rest }) {
  return (
    <div className={`${hover ? 'card' : 'card-static'} ${className}`} {...rest}>
      {children}
    </div>
  );
}
