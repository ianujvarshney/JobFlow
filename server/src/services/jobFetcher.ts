import axios from 'axios';
import xml2js from 'xml2js';

export interface JobData {
  title: string;
  description: string;
  company: string;
  location: string;
  jobType: string;
  category: string;
  salary?: string;
  url: string;
  externalId: string;
  publishedDate: Date;
}

export class JobFetcherService {
  private xmlParser: xml2js.Parser;

  constructor() {
    this.xmlParser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: false,
    });
  }

  async fetchJobsFromAPI(apiUrl: string, source: string): Promise<JobData[]> {
    try {
      console.log(`Fetching jobs from: ${apiUrl}`);
      const response = await axios.get(apiUrl, {
        timeout: 30000,
        headers: {
          'User-Agent': 'JobImporter/1.0',
          'Accept': 'application/xml, text/xml, */*',
        },
      });

      if (source === 'jobicy') {
        return this.parseJobicyFeed(response.data);
      } else if (source === 'higheredjobs') {
        return this.parseHigherEdJobsFeed(response.data);
      } else {
        throw new Error(`Unknown source: ${source}`);
      }
    } catch (error) {
      console.error(`Error fetching jobs from ${apiUrl}:`, error);
      throw error;
    }
  }

  private async parseJobicyFeed(xmlData: string): Promise<JobData[]> {
    try {
      const result = await this.xmlParser.parseStringPromise(xmlData);
      const jobs = result.rss?.channel?.item || [];
      
      return jobs.map((item: any) => {
        const title = this.extractText(item.title);
        const description = this.extractText(item.description);
        const link = this.extractText(item.link);
        const pubDate = this.extractText(item.pubDate);
        
        const company = this.extractCompanyFromDescription(description) || 'Unknown Company';
        const location = this.extractLocationFromDescription(description) || 'Remote';
        const jobType = this.extractJobTypeFromTitle(title) || 'full-time';
        const category = this.extractCategoryFromUrl(link) || 'general';
        const salary = this.extractSalaryFromDescription(description);

        return {
          title: title || 'Untitled Position',
          description: description || 'No description available',
          company,
          location,
          jobType,
          category,
          salary,
          url: link,
          externalId: this.generateExternalId(link),
          publishedDate: pubDate ? new Date(pubDate) : new Date(),
        };
      });
    } catch (error) {
      console.error('Error parsing Jobicy feed:', error);
      throw error;
    }
  }

  private async parseHigherEdJobsFeed(xmlData: string): Promise<JobData[]> {
    try {
      const result = await this.xmlParser.parseStringPromise(xmlData);
      const items = result.rss?.channel?.item || [];
      
      return items.map((item: any) => {
        const title = this.extractText(item.title);
        const description = this.extractText(item.description);
        const link = this.extractText(item.link);
        const pubDate = this.extractText(item.pubDate);
        
        return {
          title: title || 'Untitled Position',
          description: description || 'No description available',
          company: 'Higher Education Institution',
          location: 'United States',
          jobType: 'full-time',
          category: 'education',
          url: link,
          externalId: this.generateExternalId(link),
          publishedDate: pubDate ? new Date(pubDate) : new Date(),
        };
      });
    } catch (error) {
      console.error('Error parsing HigherEdJobs feed:', error);
      throw error;
    }
  }

  private extractText(field: any): string {
    if (typeof field === 'string') return field;
    if (Array.isArray(field)) return field[0] || '';
    if (field && field._) return field._;
    return '';
  }

  private extractCompanyFromDescription(description: string): string {
    const companyMatch = description.match(/Company:\s*([^\n]+)/i);
    return companyMatch ? companyMatch[1].trim() : '';
  }

  private extractLocationFromDescription(description: string): string {
    const locationMatch = description.match(/Location:\s*([^\n]+)/i);
    return locationMatch ? locationMatch[1].trim() : 'Remote';
  }

  private extractSalaryFromDescription(description: string): string {
    const salaryMatch = description.match(/Salary:\s*([^\n]+)/i);
    return salaryMatch ? salaryMatch[1].trim() : '';
  }

  private extractJobTypeFromTitle(title: string): string {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('part-time')) return 'part-time';
    if (lowerTitle.includes('contract')) return 'contract';
    if (lowerTitle.includes('intern')) return 'internship';
    return 'full-time';
  }

  private extractCategoryFromUrl(url: string): string {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    return pathParts[pathParts.length - 1] || 'general';
  }

  private generateExternalId(url: string): string {
    return Buffer.from(url).toString('base64');
  }
}