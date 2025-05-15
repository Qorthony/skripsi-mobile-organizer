import { View, Text, Image } from 'react-native'
import React from 'react'
import dayjs from 'dayjs'
import { EventTypes } from '@/constants/events-data'
const dummyPoster = require('@/assets/images/dummy_poster.png');

export default function FullWidthEventCard({ 
    name, 
    description, 
    image,
    date,
    location,
    city,
    event_link 
}: EventTypes) {
    return (
        <View className='flex-1 bg-gray-100 m-2 rounded-lg'>
            <Image source={image ? { uri: image } : dummyPoster} className='w-full h-48 rounded-lg' />
            <View className='p-2'>
                <Text className='font-bold'>
                    {name}
                </Text>
                <Text className='text-sm'>
                    {dayjs(date).format('DD MMMM YYYY')}
                </Text>
                <Text className='text-sm'>
                    {location=='online'?'Online':city}
                </Text>
            </View>
        </View>
    )
}