import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Input, InputField, InputIcon } from '@/components/ui/input'
import { Icon, SearchIcon } from '@/components/ui/icon'
import { ScrollView } from 'react-native'
import { Card } from '@/components/ui/card'
import { ATTENDEE_DATA } from '@/constants/attendee-data'
import { Divider } from '@/components/ui/divider'
import { Badge, BadgeText } from '@/components/ui/badge'
import { HStack } from '@/components/ui/hstack'

export default function Attendances() {
    const badgeColor: { [key: string]: 'muted' | 'success' | 'error' | 'warning' | 'info' } = {
        'registered': 'muted',
        'checked-in': 'success',
        'cancelled': 'error'
    }
  return (
    <SafeAreaView className='flex-1 bg-white'>
        <View className='mx-4'>
            <Text className='mb-4 text-2xl font-semibold'>Nama Event</Text>
            <Input variant='rounded' size='md'>
                <InputField placeholder='Nama Peserta'/>
                <InputIcon as={SearchIcon} size='md' className='me-2' />
            </Input>
        </View>
        <Divider className='mt-4' />
        <ScrollView className='bg-slate-100'>
            {ATTENDEE_DATA.map((attendance, index) => (
                <Card key={index} className='my-2 mx-2'>
                    <HStack className='justify-between items-center'>
                        <View>
                            <Text className='text-lg font-medium'>{attendance.name}</Text>
                            <Text className='text-sm text-gray-500'>{attendance.email}</Text>
                        </View>
                        <Badge action={badgeColor[attendance.status]}>
                            <BadgeText>{attendance.status}</BadgeText>
                        </Badge>
                    </HStack>
                </Card>
            ))}
        </ScrollView>
    </SafeAreaView>
  )
}