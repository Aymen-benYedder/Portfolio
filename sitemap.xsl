<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:template match="/">
    <html>
      <head>
        <title>XML Sitemap</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
            color: #e0e0e0;
            min-height: 100vh;
            padding: 2rem;
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
          }

          header {
            text-align: center;
            margin-bottom: 3rem;
            padding-bottom: 2rem;
            border-bottom: 2px solid rgba(0, 212, 255, 0.3);
          }

          h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            color: #00d4ff;
            font-weight: 700;
          }

          .subtitle {
            color: #a0a0a0;
            font-size: 1.1rem;
            margin-bottom: 1rem;
          }

          .stats {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-top: 1.5rem;
            flex-wrap: wrap;
          }

          .stat {
            background: rgba(0, 212, 255, 0.05);
            border: 1px solid rgba(0, 212, 255, 0.2);
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            text-align: center;
          }

          .stat-value {
            font-size: 1.8rem;
            font-weight: 700;
            color: #00d4ff;
            display: block;
          }

          .stat-label {
            font-size: 0.85rem;
            color: #a0a0a0;
            margin-top: 0.25rem;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            background: rgba(10, 14, 39, 0.8);
            border: 1px solid rgba(0, 212, 255, 0.15);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          }

          thead {
            background: linear-gradient(90deg, rgba(0, 212, 255, 0.1), rgba(0, 153, 204, 0.1));
            border-bottom: 2px solid rgba(0, 212, 255, 0.3);
          }

          th {
            padding: 1.25rem;
            text-align: left;
            font-weight: 700;
            color: #00d4ff;
            font-size: 0.95rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          td {
            padding: 1rem 1.25rem;
            border-bottom: 1px solid rgba(0, 212, 255, 0.1);
            font-size: 0.95rem;
          }

          tbody tr:hover {
            background: rgba(0, 212, 255, 0.05);
          }

          tbody tr:last-child td {
            border-bottom: none;
          }

          a {
            color: #00d4ff;
            text-decoration: none;
            word-break: break-all;
            transition: color 0.2s ease;
          }

          a:hover {
            color: #00e5ff;
            text-decoration: underline;
          }

          .priority {
            font-weight: 600;
            color: #00d4ff;
          }

          .frequency {
            color: #a0a0a0;
            font-size: 0.9rem;
          }

          .date {
            color: #a0a0a0;
            font-size: 0.9rem;
          }

          footer {
            text-align: center;
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid rgba(0, 212, 255, 0.2);
            color: #a0a0a0;
            font-size: 0.9rem;
          }

          footer a {
            color: #00d4ff;
          }

          .badge {
            display: inline-block;
            padding: 0.35rem 0.75rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
            background: rgba(0, 212, 255, 0.1);
            border: 1px solid rgba(0, 212, 255, 0.3);
            color: #00d4ff;
          }

          .priority-high {
            background: rgba(255, 193, 7, 0.1);
            border-color: rgba(255, 193, 7, 0.3);
            color: #ffc107;
          }

          .priority-medium {
            background: rgba(0, 212, 255, 0.1);
            border-color: rgba(0, 212, 255, 0.3);
            color: #00d4ff;
          }

          .priority-low {
            background: rgba(76, 175, 80, 0.1);
            border-color: rgba(76, 175, 80, 0.3);
            color: #4caf50;
          }

          @media (max-width: 768px) {
            body {
              padding: 1rem;
            }

            h1 {
              font-size: 1.8rem;
            }

            table {
              font-size: 0.85rem;
            }

            th, td {
              padding: 0.75rem;
            }

            .stats {
              gap: 1rem;
            }

            .stat {
              padding: 0.5rem 1rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <h1>📍 XML Sitemap</h1>
            <p class="subtitle">aymen.benyedder.top</p>
            <div class="stats">
              <div class="stat">
                <span class="stat-value">
                  <xsl:value-of select="count(//sitemap:url)" />
                </span>
                <span class="stat-label">Total URLs</span>
              </div>
              <div class="stat">
                <span class="stat-value">
                  <xsl:choose>
                    <xsl:when test="//sitemap:url[sitemap:priority &gt;= 0.9]">
                      <xsl:value-of select="count(//sitemap:url[sitemap:priority &gt;= 0.9])" />
                    </xsl:when>
                    <xsl:otherwise>0</xsl:otherwise>
                  </xsl:choose>
                </span>
                <span class="stat-label">High Priority</span>
              </div>
              <div class="stat">
                <span class="stat-value">
                  <xsl:choose>
                    <xsl:when test="//sitemap:url[sitemap:lastmod]">
                      <xsl:value-of select="count(//sitemap:url[sitemap:lastmod])" />
                    </xsl:when>
                    <xsl:otherwise>0</xsl:otherwise>
                  </xsl:choose>
                </span>
                <span class="stat-label">With Last Modified</span>
              </div>
            </div>
          </header>

          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th style="width: 150px;">Last Modified</th>
                <th style="width: 110px;">Frequency</th>
                <th style="width: 80px;">Priority</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="//sitemap:url">
                <tr>
                  <td>
                    <a href="{sitemap:loc}">
                      <xsl:value-of select="sitemap:loc" />
                    </a>
                  </td>
                  <td class="date">
                    <xsl:if test="sitemap:lastmod">
                      <xsl:value-of select="sitemap:lastmod" />
                    </xsl:if>
                  </td>
                  <td class="frequency">
                    <span class="badge">
                      <xsl:value-of select="sitemap:changefreq" />
                    </span>
                  </td>
                  <td>
                    <span>
                      <xsl:attribute name="class">
                        <xsl:choose>
                          <xsl:when test="sitemap:priority &gt;= 0.9">badge priority-high</xsl:when>
                          <xsl:when test="sitemap:priority &gt;= 0.7">badge priority-medium</xsl:when>
                          <xsl:otherwise>badge priority-low</xsl:otherwise>
                        </xsl:choose>
                      </xsl:attribute>
                      <xsl:value-of select="sitemap:priority" />
                    </span>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>

          <footer>
            <p>
              This sitemap was automatically generated. For more information, visit
              <a href="https://www.sitemaps.org/">sitemaps.org</a>
            </p>
            <p style="margin-top: 1rem; color: #666;">
              Generated: <xsl:value-of select="//sitemap:url[1]/sitemap:lastmod" /> • SEO-optimized sitemap
            </p>
          </footer>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
