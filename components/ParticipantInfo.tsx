import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/card';
import { Badge, BadgeText } from '@/components/ui/badge';

interface ParticipantInfoProps {
  participant: {
    user?: {
      name?: string;
      email?: string;
    };
    email_penerima?: string;
    status?: string;
    ticket_type?: string;
  } | null;
  visible: boolean;
}

const ParticipantInfo = ({ participant, visible }: ParticipantInfoProps) => {
  if (!visible || !participant) return null;

  const name = participant.user?.name || 'Unknown';
  const email = participant.user?.email || participant.email_penerima || 'No email';
  const ticketType = participant.ticket_type || 'Standard';
  const status = participant.status || 'checked-in';

  // Define badge colors based on status
  const badgeColor: Record<string, 'success' | 'error' | 'muted' | 'warning' | 'info'> = {
    'registered': 'muted',
    'checked-in': 'success',
    'cancelled': 'error'
  };

  return (
    <Card className='p-4 w-full'>
      <View style={styles.row}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{name}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{email}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Ticket:</Text>
        <Text style={styles.value}>{ticketType}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Status:</Text>
        <Badge action={badgeColor[status as keyof typeof badgeColor] || 'muted'}>
          <BadgeText>{status}</BadgeText>
        </Badge>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
  },
  value: {
    fontSize: 16,
  },
});

export default ParticipantInfo;
