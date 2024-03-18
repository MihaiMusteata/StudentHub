import { Hourglass, ThreeDots } from "react-loader-spinner"

const LoadingScreen = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column' }}>
            <Hourglass
                visible={true}
                height="80"
                width="80"
                ariaLabel="hourglass-loading"
                wrapperStyle={{}}
                wrapperClass=""
                colors={['#306cce', '#72a1ed']}
            />
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                <h1 style={{ color: '#2a5db5', marginRight: '10px' }}>Loading</h1>
                <ThreeDots
                    visible={true}
                    height="80"
                    width="80"
                    color="#306cce"
                    radius="9"
                    ariaLabel="three-dots-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                />
            </div>
        </div>
    )
}
export default LoadingScreen;