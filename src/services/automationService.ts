
import { useToast } from "@/hooks/use-toast";

export interface AutomationRule {
  id: string;
  name: string;
  type: "product_deactivation" | "low_stock" | "margin_warning" | "whatsapp_notification";
  isActive: boolean;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  lastTriggered?: string;
  triggeredCount: number;
}

export interface Product {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  lastSaleDate?: string;
  margin?: number;
  isActive: boolean;
}

class AutomationService {
  private rules: AutomationRule[] = [];
  private whatsappConfig = {
    apiKey: "",
    phoneNumber: "",
    isConfigured: false
  };

  constructor() {
    this.loadRules();
    this.startAutomationLoop();
  }

  private loadRules() {
    // Load rules from localStorage or API
    const savedRules = localStorage.getItem('automation_rules');
    if (savedRules) {
      this.rules = JSON.parse(savedRules);
    }
  }

  private saveRules() {
    localStorage.setItem('automation_rules', JSON.stringify(this.rules));
  }

  public addRule(rule: AutomationRule) {
    this.rules.push(rule);
    this.saveRules();
  }

  public updateRule(ruleId: string, updatedRule: Partial<AutomationRule>) {
    this.rules = this.rules.map(rule => 
      rule.id === ruleId 
        ? { ...rule, ...updatedRule }
        : rule
    );
    this.saveRules();
  }

  public deleteRule(ruleId: string) {
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
    this.saveRules();
  }

  public getRules(): AutomationRule[] {
    return this.rules;
  }

  public configureWhatsApp(apiKey: string, phoneNumber: string) {
    this.whatsappConfig = {
      apiKey,
      phoneNumber,
      isConfigured: true
    };
    localStorage.setItem('whatsapp_config', JSON.stringify(this.whatsappConfig));
  }

  private async sendWhatsAppMessage(message: string) {
    if (!this.whatsappConfig.isConfigured) {
      console.log("WhatsApp not configured");
      return;
    }

    try {
      // Simulate WhatsApp API call
      console.log(`Sending WhatsApp to ${this.whatsappConfig.phoneNumber}: ${message}`);
      
      // In a real implementation, you would call the WhatsApp Business API
      // const response = await fetch('https://api.whatsapp.com/send', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.whatsappConfig.apiKey}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     to: this.whatsappConfig.phoneNumber,
      //     text: { body: message }
      //   })
      // });
      
      return true;
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      return false;
    }
  }

  private async sendEmailNotification(subject: string, message: string) {
    // Simulate email sending
    console.log(`Email: ${subject} - ${message}`);
    return true;
  }

  public async checkProductDeactivation(products: Product[]) {
    const rule = this.rules.find(r => r.type === 'product_deactivation' && r.isActive);
    if (!rule) return;

    const inactiveDays = rule.conditions.inactiveDays || 15;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);

    const inactiveProducts = products.filter(product => {
      if (!product.lastSaleDate || !product.isActive) return false;
      const lastSale = new Date(product.lastSaleDate);
      return lastSale < cutoffDate;
    });

    for (const product of inactiveProducts) {
      console.log(`Auto-deactivating product: ${product.name}`);
      
      // Update product status
      product.isActive = false;
      
      // Send notifications
      if (rule.actions.notify) {
        await this.sendEmailNotification(
          "Produto Desativado Automaticamente",
          `O produto "${product.name}" foi desativado por inatividade de ${inactiveDays} dias.`
        );
      }

      if (rule.actions.whatsapp && this.whatsappConfig.isConfigured) {
        await this.sendWhatsAppMessage(
          `🚫 Produto "${product.name}" foi desativado por inatividade de ${inactiveDays} dias.`
        );
      }
    }

    if (inactiveProducts.length > 0) {
      this.updateRuleStats(rule.id, inactiveProducts.length);
    }
  }

  public async checkLowStock(products: Product[]) {
    const rule = this.rules.find(r => r.type === 'low_stock' && r.isActive);
    if (!rule) return;

    const threshold = rule.conditions.percentage || 50;
    
    const lowStockProducts = products.filter(product => {
      const stockPercentage = (product.currentStock / product.minStock) * 100;
      return stockPercentage <= threshold && product.isActive;
    });

    for (const product of lowStockProducts) {
      const stockPercentage = Math.round((product.currentStock / product.minStock) * 100);
      
      if (rule.actions.email) {
        await this.sendEmailNotification(
          "Alerta de Estoque Baixo",
          `O produto "${product.name}" está com estoque baixo: ${product.currentStock} unidades (${stockPercentage}% do mínimo).`
        );
      }

      if (rule.actions.whatsapp && this.whatsappConfig.isConfigured) {
        await this.sendWhatsAppMessage(
          `⚠️ ESTOQUE BAIXO: "${product.name}" - ${product.currentStock} unidades (${stockPercentage}% do mínimo)`
        );
      }
    }

    if (lowStockProducts.length > 0) {
      this.updateRuleStats(rule.id, lowStockProducts.length);
    }
  }

  public async checkMarginWarnings(products: Product[]) {
    const rule = this.rules.find(r => r.type === 'margin_warning' && r.isActive);
    if (!rule) return;

    const marginThreshold = rule.conditions.marginThreshold || 20;
    
    const lowMarginProducts = products.filter(product => {
      return product.margin !== undefined && 
             product.margin < marginThreshold && 
             product.isActive;
    });

    for (const product of lowMarginProducts) {
      if (rule.actions.notify) {
        await this.sendEmailNotification(
          "Aviso de Margem Baixa",
          `O produto "${product.name}" está com margem baixa: ${product.margin}% (abaixo de ${marginThreshold}%).`
        );
      }

      if (rule.actions.whatsapp && this.whatsappConfig.isConfigured) {
        await this.sendWhatsAppMessage(
          `📉 MARGEM BAIXA: "${product.name}" - ${product.margin}% (limite: ${marginThreshold}%)`
        );
      }
    }

    if (lowMarginProducts.length > 0) {
      this.updateRuleStats(rule.id, lowMarginProducts.length);
    }
  }

  private updateRuleStats(ruleId: string, triggeredCount: number) {
    this.rules = this.rules.map(rule => 
      rule.id === ruleId 
        ? { 
            ...rule, 
            lastTriggered: new Date().toISOString().split('T')[0],
            triggeredCount: rule.triggeredCount + triggeredCount
          }
        : rule
    );
    this.saveRules();
  }

  public async runAllAutomations(products: Product[]) {
    console.log("Running automation checks...");
    
    try {
      await this.checkProductDeactivation(products);
      await this.checkLowStock(products);
      await this.checkMarginWarnings(products);
    } catch (error) {
      console.error("Error running automations:", error);
    }
  }

  private startAutomationLoop() {
    // Run automations every 5 minutes (in production, this would be longer)
    setInterval(() => {
      // In a real app, you would fetch products from your data source
      const sampleProducts: Product[] = [
        {
          id: "P001",
          name: "Alface hidropônica",
          currentStock: 5,
          minStock: 20,
          lastSaleDate: "2024-01-01",
          margin: 15,
          isActive: true
        },
        {
          id: "P002",
          name: "Tomate grape",
          currentStock: 3,
          minStock: 10,
          lastSaleDate: "2024-01-16",
          margin: 38,
          isActive: true
        }
      ];
      
      this.runAllAutomations(sampleProducts);
    }, 5 * 60 * 1000); // 5 minutes
  }
}

export const automationService = new AutomationService();
