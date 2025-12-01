import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                zIndex: 10000,
                padding: '0.5rem 1rem',
                fontSize: '0.8rem',
                minWidth: '120px'
            }}
        >
            {theme === 'retro' ? '☀ LIGHT MODE' : '⚡ RETRO MODE'}
        </button>
    );
}
