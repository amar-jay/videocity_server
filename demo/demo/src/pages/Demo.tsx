
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface DemoProps {
}
export function Demo (props: DemoProps) {
	return (
		<div className="">
			{JSON.stringify(props)}
		</div>
	)
}
