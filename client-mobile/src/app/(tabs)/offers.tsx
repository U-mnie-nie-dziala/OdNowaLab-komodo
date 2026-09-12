import { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, StyleSheet } from 'react-native';

import { ApiError } from '@/api/client';
import { companiesApi } from '@/api/companies';
import { servicesApi } from '@/api/services';
import { CompanyDto, ServiceDto } from '@/api/types';
import { transactionsApi } from '@/api/transactions';
import { Badge } from '@/components/badge';
import { Card, CardRow } from '@/components/card';
import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { useSession } from '@/context/session-context';

export default function OffersScreen() {
  const { user, refreshUser } = useSession();
  const [services, setServices] = useState<ServiceDto[] | null>(null);
  const [companiesById, setCompaniesById] = useState<Map<number, CompanyDto>>(new Map());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [redeemingId, setRedeemingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const [serviceList, companyList] = await Promise.all([servicesApi.getAll(), companiesApi.getAll()]);
    setCompaniesById(new Map(companyList.map((c) => [c.id, c])));
    setServices([...serviceList].sort((a, b) => a.coinCost - b.coinCost));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  };

  const redeem = async (service: ServiceDto) => {
    if (!user) return;
    setRedeemingId(service.id);
    try {
      await transactionsApi.create({
        userId: user.id,
        serviceId: service.id,
        date: new Date().toISOString().slice(0, 10),
      });
      await refreshUser();
      Alert.alert('Gotowe!', `Wymieniono ${service.coinCost} pkt na: ${service.name}`);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Spróbuj ponownie później.';
      Alert.alert('Nie udało się wymienić punktów', message);
    } finally {
      setRedeemingId(null);
    }
  };

  const confirmRedeem = (service: ServiceDto) => {
    Alert.alert(
      'Potwierdź wymianę',
      `Czy na pewno chcesz wymienić ${service.coinCost} pkt na "${service.name}"?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Wymień', onPress: () => redeem(service) },
      ]
    );
  };

  return (
    <Screen refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}>
      <ThemedText type="pageHeader">Oferty</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Wymieniaj zebrane punkty na rabaty u lokalnych przedsiębiorców.
      </ThemedText>

      {services === null && (
        <ThemedText type="small" themeColor="textSecondary">
          Wczytywanie…
        </ThemedText>
      )}

      {services?.map((service) => {
        const provider = service.providerId != null ? companiesById.get(service.providerId) : undefined;
        const canAfford = (user?.coins ?? 0) >= service.coinCost;

        return (
          <Card key={service.id}>
            <CardRow>
              <ThemedText type="smallBold" style={styles.flexText}>
                {service.name}
              </ThemedText>
              <ThemedText type="smallBold">{service.coinCost} pkt</ThemedText>
            </CardRow>

            {provider && (
              <CardRow>
                <ThemedText type="small" themeColor="textSecondary">
                  {provider.name}
                </ThemedText>
                {provider.isInRevitalizationZone && <Badge label="Strefa rewitalizacji" tone="positive" />}
              </CardRow>
            )}

            <PrimaryButton
              label={canAfford ? 'Wymień punkty' : 'Za mało punktów'}
              onPress={() => confirmRedeem(service)}
              disabled={!canAfford}
              loading={redeemingId === service.id}
            />
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flexText: {
    flex: 1,
  },
});
