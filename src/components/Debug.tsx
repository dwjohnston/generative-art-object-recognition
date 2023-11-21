type DebugProps = {
    data: unknown; 
}

export function Debug(props: DebugProps) {
    return <pre className="debug">
        {JSON.stringify(props.data, null,2)}
    </pre>
}