import styles from './style.module.scss'

export const LoadingSpinner: React.VFC = () => {
  return (
    <svg className={styles.spinner} viewBox="0 0 32 32">
      <circle
        className={styles.path}
        cx="50%"
        cy="50%"
        r="45%"
        fill="none"
        strokeWidth="5%"
      ></circle>
    </svg>
  )
}
