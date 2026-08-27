import React from 'react';
import cx from 'classnames';

const SocialIcons = ({ social, className }) => {
  return social && social.length ? (
    <div className={cx('social-icons flex items-center', className)}>
      {social.map((item) => (
        <a
          key={item.name}
          title={item.name}
          href={item.href}
          target="_blank"
          rel="noreferrer"
        >
          <img
            src={item.src}
            title={`${item.name} social`}
            alt={`${item.name} social`}
            style={item.width ? { width: `${item.width}px` } : undefined}
          />
        </a>
      ))}
    </div>
  ) : null;
}

export default SocialIcons;
