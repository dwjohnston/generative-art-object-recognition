type DebugProps = {
    data: unknown; 
}

export function Debug(props: DebugProps) {
    return <pre>
        {JSON.stringify(props.data, null,2)}
    </pre>
}