# -*- coding: utf-8 -*-

import os
import time
import pickle



import datetime




from django.conf import settings
from django.db.models import Q
from tranio.shortcuts import Transaction
from tranio.main.models import Ad, AdPhoto
from tranio.main.staticdata import ObjectType


def count(p):
    from tranio.main.locations import LocationDataTree
    return sum(_p['total']['total'] for _p in LocationDataTree().get_by_model(p)['ad_sell_type'].values())

for c in Country.objects.all():
    dups = set()
    dups |= {c.slug} & set(Region.objects.filter(country=c).values_list('slug', flat=True))
    dups |= {c.slug} & set(FakeRegion.objects.filter(country=c).values_list('slug', flat=True))
    dups |= {c.slug} & set(Locality.objects.filter(country=c).values_list('slug', flat=True))
    dups |= set(Region.objects.filter(country=c).values_list('slug', flat=True)) & set(FakeRegion.objects.filter(country=c).values_list('slug', flat=True))
    dups |= set(Region.objects.filter(country=c).values_list('slug', flat=True)) & set(Locality.objects.filter(country=c).values_list('slug', flat=True))
    dups |= set(FakeRegion.objects.filter(country=c).values_list('slug', flat=True)) & set(Locality.objects.filter(country=c).values_list('slug', flat=True))

    if dups:
        print c.name
    for d in dups:
        print '%s' % d
        if c.slug == d:
            print '\tCountry', c.get_absolute_url(), count(c)
        for r in Region.objects.filter(country=c, slug=d):
            print '\tRegion', r.get_absolute_url(), count(r)
        for fr in FakeRegion.objects.filter(country=c, slug=d):
            print '\tFakeRegion', fr.get_absolute_url(), count(fr)
        for l in Locality.objects.filter(country=c, slug=d):
            print '\tLocality', l.get_absolute_url(), count(l)
    if dups:
        print '\n'



min_width = settings.CREATEAD_UPLOAD_MIN_WIDTH
min_height = settings.CREATEAD_UPLOAD_MIN_HEIGHT
not_requires_photo = [o.id for o in ObjectType.objects if not o.requires_photo]

with Transaction() as tx:
    photos = AdPhoto.objects.filter(Q(width__lt=min_width) | Q(height__lt=min_height))
    ad_pks = set(photos.values_list('version__ad', flat=True))
    photos_count = photos.count()
    photos.delete()
    print('%d AdPhoto deleted' % photos_count)

    ads = Ad.objects.filter(pk__in=ad_pks, approved__photos__isnull=True)
    ads = ads.exclude(approved__object_type__in=not_requires_photo)
    ads.update(deleted_at=datetime.datetime.now(), is_visible=False)
    print('%d Ad deleted' % ads.count())
    tx.commit()



def test(n):
    import time
    import distance
    from simhash import Simhash, SimhashIndex

    WIDTH = 3

    def gg():
        import random
        from random import randint
        from simhash import Simhash, SimhashIndex
        from itertools import groupby
        # text = str(bin(randint(2**63, 2**64-1)))[2:]
        # tokens = [text[i:i + WIDTH] for i in range(max(len(text) - WIDTH + 1, 1))]
        # return text, Simhash({k: sum(1 for _ in g) for k, g in groupby(sorted(tokens))})
        text = ''.join([random.choice('0123456789abcdef') for _ in range(36)])
        return text, Simhash(text)

    hashes = [gg() for _ in range(n)]
    d1, d2 = [], []
    test_string, test_hash = gg()

    start = time.time()
    for s, h in hashes:
        d1.append([distance.hamming(test_string, s), s])
    print time.time() - start

    start = time.time()
    index = SimhashIndex(hashes, k=5)
    for st in index.get_near_dups(test_hash):
        d2.append([distance.hamming(test_string, st), st])
    print time.time() - start

    print len(d1), len(d2)

    for a, b in zip(sorted(d1)[:20], sorted(d2)):
        print a[1] == b[1], '\t', a, '\t', b
        # print a[1], '\n', b[1], '\n\n'


deleted = 0
for p in AdPhoto.objects.filter(photo__contains='/home/tranio/'):
    # print p.photo.path
    if not TranioImage(p.photo.path):
        deleted += 1
        if not deleted % 10:
            print 'deleted', deleted
        p.delete()
        continue
    p.photo = p.photo.path.replace('/home/tranio/tranio/media/', '')
    p.save()


re_basename = re.compile(r'^[a-f\d]{28}$')
for root, _, files in os.walk(settings.CACHES['default']['LOCATION']):
    for f in files:
        if re_basename.match(f):
            pathname = os.path.join(root, f)
            try:
                tm, key, tag = pickle.load(open(os.path.join(root, f), 'rb'))
            except EOFError:
                os.unlink(pathname)
                continue
            if not tag and 'popular_countries_new' in key:
                print 'deleting', key
                os.unlink(pathname)
            time.sleep(0.01)
        else:
            print 'not matched basename:', f


ens = Enquiry.objects.filter(leadinfo__isnull=False, head__isnull=True, salesmanager__isnull=False)
ens = ens.exclude(salesmanager__set_date__lte=datetime.datetime(2015, 1, 12)).distinct()
for en in ens:
    sm = list(en.salesmanager_set.order_by('set_date'))
    wfi = WorkflowItem.allobjects.filter(kind=WorkflowItem.MANAGER_CHANGED, leadinfo=en.leadinfo).order_by('created_at')

    for s, w in zip(sm, wfi):
        delta = w.occurred_at - s.set_date
        delta_sec = delta.total_seconds()
        if delta_sec < -86400 or delta_sec > 86400:
            print 'BIG DELTA!'
            print [w.occurred_at, s.set_date]
            print w.pk, s.pk, en.pk, '\n'
            continue

        w.occurred_at = s.set_date
        w.created_at = s.set_date
        w.save()
        print w.pk

for li in LeadInfo.objects.filter(pk__gte=33920, enquiry__isnull=False):
    en = li.enquiry
    sales_managers = en.salesmanager_set.order_by('set_date')
    workflows = li.workflow.filter(kind=WorkflowItem.MANAGER_CHANGED).order_by('created_at')
    for sm, wfi in zip(sales_managers, workflows):
        dates = [sm.set_date, wfi.occurred_at]
        print li.pk, max(dates) - min(dates)


lines = []
for num, group in enumerate(groups):
    lines.append(u'Group #%s\n' % (num + 1))
    for aid in group:
        ad = Ad.objects.get(pk=aid)
        params = ad.get_absolute_url(), ad.user.username, ad.dao().price_smart(), ad.approved.area_object
        line = u'https://tranio.ru%s\t%s\t%s\t%s\n' % params
        lines.append(line.encode('utf8'))
    lines.append(u'\n')
file('/tmp/sim2.txt', 'w').writelines(lines)


from collections import Counter

from PIL import Image

failed = []
media = '/home/tranio/tranio/media/'

ads = Ad.objects.filter(is_visible=True)
photos = sorted(filter(bool, set(ads.values_list('approved__photos__photo', flat=True))))
for photo in photos:
    if not os.path.isfile(media + photo):
        failed.append(photo)
        print photo


    print ad_photo
    try:
        img = Image.open(media + ad_photo)
        cr = img.crop([0, img.height-2, img.width, img.height])
        if set(cr.getdata()) in [set([(128, 128, 128)]), set([(0, 0, 0)])]:
            photo = AdPhoto.objects.get(photo=ad_photo).select_related('version__ad')
            failed_ids.append(photo.id)
            failed_ads.append(photo.version.ad.get_absolute_url())
            print media + ad_photo
        img.close()
    except Exception as e:
        continue


# all path;ads_count
urls = []
params = []
purposes = ['sell']
features = [None] + FeatureManager.MODIFIERS.values()
modifiers = [None] + ModifierManager.MODIFIERS.values()
types = [None] + OTItem.all() + OTCase.all() + OTGroup.all()
for ot in types:
    for _feature in features:
        for _modifier in modifiers:
            for purpose in purposes:
                params.append([purpose, ot, _feature, _modifier])
params = {str(p): p for p in params}.values()
place = Place.objects.get(path='/')
for p in sorted(params):
    try:
        lf = LocationFilter('', place=place, purpose=p[0], types=p[1], feature=p[2], modifier=p[3])
        urls.append([lf.url, lf.ads.count()])
    except InvalidLocationFilter:
        continue