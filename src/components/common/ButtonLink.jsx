import { Link } from 'react-router-dom';
import { buttonClasses } from './Button';

/** A router link that looks like a Button (avoids nesting buttons inside links). */
export function ButtonLink({ to, variant = 'primary', size = 'md', leftIcon: LeftIcon, rightIcon: RightIcon, className, children, ...props }) {
  return (
    <Link to={to} className={buttonClasses({ variant, size, className })} {...props}>
      {LeftIcon ? <LeftIcon className="h-4 w-4" aria-hidden="true" /> : null}
      {children}
      {RightIcon ? <RightIcon className="h-4 w-4" aria-hidden="true" /> : null}
    </Link>);

}