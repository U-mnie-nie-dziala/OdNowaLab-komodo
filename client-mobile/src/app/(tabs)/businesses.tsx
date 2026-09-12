import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';

import { getApiBaseUrl } from '@/api/client';
import { companiesApi } from '@/api/companies';
import { servicesApi } from '@/api/services';
import { CompanyDto, ServiceDto } from '@/api/types';
import { Badge } from '@/components/badge';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { Collapsible } from '@/components/ui/collapsible';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export default function BusinessesScreen() {
  const [companies, setCompanies] = useState<CompanyDto[] | null>(null);
  const [servicesByCompany, setServicesByCompany] = useState<Map<number, ServiceDto[]>>(new Map());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState('');

  const load = useCallback(async () => {
    const [companyList, serviceList, baseUrl] = await Promise.all([
      companiesApi.getAll(),
      servicesApi.getAll(),
      getApiBaseUrl(),
    ]);
    setApiBaseUrl(baseUrl);
    const grouped = new Map<number, ServiceDto[]>();
    for (const service of serviceList) {
      if (service.providerId == null) continue;
      const existing = grouped.get(service.providerId) ?? [];
      existing.push(service);
      grouped.set(service.providerId, existing);
    }
    setServicesByCompany(grouped);
    setCompanies(
      [...companyList].sort((a, b) => Number(b.isInRevitalizationZone) - Number(a.isInRevitalizationZone))
    );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  };

  const mapRegion: Region | undefined = useMemo(() => {
    if (!companies || companies.length === 0) return undefined;
    const lats = companies.map((c) => c.locationX);
    const lngs = companies.map((c) => c.locationY);
    return {
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
      longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      latitudeDelta: Math.max(Math.max(...lats) - Math.min(...lats), 0.02) * 1.8,
      longitudeDelta: Math.max(Math.max(...lngs) - Math.min(...lngs), 0.02) * 1.8,
    };
  }, [companies]);

  return (
    <Screen refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}>
      <ThemedText type="title" style={styles.title}>
        Przedsiębiorstwa
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Firmy oznaczone jako &quot;Strefa rewitalizacji&quot; naliczają punkty za zakupy.
      </ThemedText>

      {companies === null && (
        <ThemedText type="small" themeColor="textSecondary">
          Wczytywanie…
        </ThemedText>
      )}

      {mapRegion && (
        <Card style={styles.mapCard}>
          <MapView style={styles.map} initialRegion={mapRegion}>
            {companies?.map((company) => (
              <Marker
                key={company.id}
                coordinate={{ latitude: company.locationX, longitude: company.locationY }}
                title={company.name}
                description={company.isInRevitalizationZone ? 'Strefa rewitalizacji' : 'Poza strefą'}
                pinColor={company.isInRevitalizationZone ? '#1e8e5a' : '#8a8a8a'}
              />
            ))}
          </MapView>
        </Card>
      )}

      {companies?.map((company) => {
        const offers = servicesByCompany.get(company.id) ?? [];
        return (
          <Card key={company.id}>
            {company.picture && (
              <Image
                style={styles.companyImage}
                source={{ uri: `${apiBaseUrl}${company.picture}` }}
                contentFit="cover"
                transition={150}
              />
            )}
            <ThemedText type="smallBold">{company.name}</ThemedText>
            <Badge
              label={company.isInRevitalizationZone ? 'Strefa rewitalizacji' : 'Poza strefą'}
              tone={company.isInRevitalizationZone ? 'positive' : 'neutral'}
            />
            <ThemedText type="small" themeColor="textSecondary">
              {company.description}
            </ThemedText>

            {offers.length > 0 && (
              <Collapsible title={`Oferty (${offers.length})`}>
                {offers.map((offer) => (
                  <ThemedText key={offer.id} type="small" style={styles.offerRow}>
                    {offer.name} — {offer.coinCost} pkt
                  </ThemedText>
                ))}
              </Collapsible>
            )}
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  offerRow: {
    paddingVertical: Spacing.half,
  },
  mapCard: {
    padding: 0,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: 220,
  },
  companyImage: {
    width: '100%',
    height: 140,
    borderRadius: Spacing.two,
  },
});
