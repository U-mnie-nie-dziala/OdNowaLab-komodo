import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet } from 'react-native';

import { coinAdditionsApi } from '@/api/coin-additions';
import { companiesApi } from '@/api/companies';
import { servicesApi } from '@/api/services';
import { transactionsApi } from '@/api/transactions';
import { Card, CardRow } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { useSession } from '@/context/session-context';

type ActivityItem = {
  id: string;
  date: string;
  title: string;
  amount: number;
};

export default function WalletScreen() {
  const { user } = useSession();
  const [activity, setActivity] = useState<ActivityItem[] | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const [coinAdditions, transactions, companies, services] = await Promise.all([
      coinAdditionsApi.getByUserId(user.id),
      transactionsApi.getByUserId(user.id),
      companiesApi.getAll(),
      servicesApi.getAll(),
    ]);

    const companyNameById = new Map(companies.map((c) => [c.id, c.name]));
    const serviceById = new Map(services.map((s) => [s.id, s]));

    const earnItems: ActivityItem[] = coinAdditions.map((entry) => ({
      id: `earn-${entry.id}`,
      date: entry.date,
      title: `Zakup u: ${companyNameById.get(entry.companyId) ?? 'nieznana firma'}`,
      amount: entry.coinAmount,
    }));

    const redeemItems: ActivityItem[] = transactions.map((entry) => {
      const service = serviceById.get(entry.serviceId);
      return {
        id: `redeem-${entry.id}`,
        date: entry.date,
        title: `Wymieniono: ${service?.name ?? 'nieznana oferta'}`,
        amount: -(service?.coinCost ?? 0),
      };
    });

    const merged = [...earnItems, ...redeemItems].sort((a, b) => (a.date < b.date ? 1 : -1));
    setActivity(merged);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  };

  if (!user) return null;

  return (
    <Screen refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}>
      <ThemedText type="title" style={styles.title}>
        Portfel
      </ThemedText>

      <Card>
        <ThemedText type="small" themeColor="textSecondary">
          Saldo
        </ThemedText>
        <ThemedText type="title" style={styles.balance}>
          {user.coins} pkt
        </ThemedText>
      </Card>

      <ThemedText type="smallBold">Historia</ThemedText>

      {activity === null && (
        <ThemedText type="small" themeColor="textSecondary">
          Wczytywanie…
        </ThemedText>
      )}

      {activity !== null && activity.length === 0 && (
        <ThemedText type="small" themeColor="textSecondary">
          Brak operacji. Zrób zakupy w strefie rewitalizacji, aby zdobyć pierwsze punkty.
        </ThemedText>
      )}

      {activity?.map((item) => (
        <Card key={item.id}>
          <CardRow>
            <ThemedText type="small" style={styles.activityTitle}>
              {item.title}
            </ThemedText>
            <ThemedText
              type="smallBold"
              style={item.amount >= 0 ? styles.positiveAmount : styles.negativeAmount}>
              {item.amount >= 0 ? '+' : ''}
              {item.amount} pkt
            </ThemedText>
          </CardRow>
          <ThemedText type="small" themeColor="textSecondary">
            {item.date}
          </ThemedText>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  balance: {
    fontSize: 40,
    lineHeight: 46,
  },
  activityTitle: {
    flex: 1,
  },
  positiveAmount: {
    color: '#1e8e5a',
  },
  negativeAmount: {
    color: '#e5484d',
  },
});
