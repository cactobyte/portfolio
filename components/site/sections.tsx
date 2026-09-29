import { closedDays, formatHours } from "@/lib/sites/hours";
import type { Business, PriceGroup, Section } from "@/lib/sites/types";
import { directionsUrl, formatPhone, formatPrice, mapEmbedUrl, telUrl } from "./links";

function PriceList({ intro, groups }: { intro?: string; groups: PriceGroup[] }) {
  return (
    <>
      {intro && <p className="section-intro">{intro}</p>}
      <div className="price-groups">
        {groups.map((group) => (
          <div key={group.title} className="price-group">
            <h3 className="price-group-title">{group.title}</h3>
            <ul className="price-items">
              {group.items.map((item) => (
                <li key={item.name} className="price-item">
                  <div className="price-item-head">
                    <span className="price-item-name">
                      {item.name}
                      {item.nameZh && (
                        <span className="price-item-zh" lang="zh-Hant">
                          {item.nameZh}
                        </span>
                      )}
                    </span>
                    <span className="price-item-price">
                      {item.price !== undefined ? formatPrice(item.price, item.priceFrom) : "Ask us"}
                      {item.unit && <span className="price-item-unit"> {item.unit}</span>}
                    </span>
                  </div>
                  {item.description && <p className="price-item-desc">{item.description}</p>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}

function Visit({ business }: { business: Business }) {
  const closed = closedDays(business.hours);
  return (
    <div className="visit">
      <div className="visit-details">
        <address className="visit-address">
          {business.address.line}
          <br />
          {business.address.district}
          {business.address.lineZh && (
            <span className="visit-address-zh" lang="zh-Hant">
              {business.address.lineZh}
            </span>
          )}
        </address>
        <table className="visit-hours">
          <caption>Opening hours</caption>
          <tbody>
            {formatHours(business.hours).map((row) => (
              <tr key={row.days}>
                <th scope="row">{row.days}</th>
                <td>{row.time}</td>
              </tr>
            ))}
            {closed && (
              <tr>
                <th scope="row">{closed}</th>
                <td>Closed</td>
              </tr>
            )}
          </tbody>
        </table>
        <ul className="visit-contact">
          {business.phone && (
            <li>
              <a href={telUrl(business.phone)}>{formatPhone(business.phone)}</a>
            </li>
          )}
          {business.email && (
            <li>
              <a href={`mailto:${business.email}`}>{business.email}</a>
            </li>
          )}
          <li>
            <a href={directionsUrl(business)} target="_blank" rel="noopener">
              Open in Google Maps
            </a>
          </li>
        </ul>
      </div>
      <iframe
        className="visit-map"
        src={mapEmbedUrl(business)}
        title={`Map showing ${business.name}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export function SiteSection({ section, business }: { section: Section; business: Business }) {
  return (
    <section id={section.id} className={`site-section site-section-${section.type}`}>
      <h2 className="section-title">{section.title}</h2>
      {section.type === "priceList" && <PriceList intro={section.intro} groups={section.groups} />}
      {section.type === "story" && (
        <div className="story">
          {section.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      )}
      {section.type === "visit" && <Visit business={business} />}
    </section>
  );
}
