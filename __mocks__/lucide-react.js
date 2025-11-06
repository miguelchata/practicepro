
const React = require('react');

const createLucideIcon = (iconName) => {
  const Icon = ({ 'data-testid': dataTestid, ...props }) => {
    return React.createElement('svg', { 'data-lucide': iconName, 'data-testid': dataTestid || `lucide-icon-${iconName}`, ...props });
  };
  Icon.displayName = `${iconName}`;
  return Icon;
};

const icons = new Proxy({}, {
    get: function(target, prop) {
        if (prop === '__esModule') {
            return false;
        }
        return createLucideIcon(prop);
    }
});

module.exports = icons;
