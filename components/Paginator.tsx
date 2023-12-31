import { StyleSheet, Animated, useWindowDimensions, View } from 'react-native'

const Paginator = ({ data, scrollX }: {data: any, scrollX: any}) => {

    const { width } = useWindowDimensions();

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'center'}}>
            { data.map((_: any, i: any) => {
                const inputRange = [(i - 1) * width, i * width, (i + 1) * width]

                const dotWidth = scrollX.interpolate({
                    inputRange,
                    outputRange: [10, 20, 10],
                    extrapolate: 'clamp'
                })

                const opacity = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp'
                })

                return <Animated.View style={[styles.dot, { width: dotWidth, opacity }]} key={i.toString()}/>
            })}
        </View>
    )
}

export default Paginator

const styles = StyleSheet.create({

    dot: {
        height: 10,
        borderRadius: 5,
        backgroundColor: '#3D889A',
        marginHorizontal: 8
    }
})
