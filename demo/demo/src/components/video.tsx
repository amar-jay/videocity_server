import styles from './video.module.css'

interface VideoProps {

	id: string
}
export function Video ({id}: VideoProps) {
	return (
		<video id={id} autoPlay playsInline className={styles.Player}></video>
	)
}
