import Plugin, { runPlugin } from "npm:@dotmatrixlabs/dotx-plugin-sdk";
import { pause, play, next, previous } from "npm:win-media-control";

class MediaControlPlugin extends Plugin {
  private pauseChannels = new Set<number>();
  private pausedChannels = new Set<number>();
  private skipChannels = new Set<number>();
  private skipWaitingForCenter = new Map<number, boolean>();

  async onLoad(): Promise<void> {
    this.setupConfig();
    await this.setupSettingsPage();
    this.setupPauseButton();
    this.setupSkipButton();
    this.setupDeviceUpdates();
  }

  async onUnload(): Promise<void> {
    this.pauseChannels.clear();
    this.pausedChannels.clear();
    this.skipChannels.clear();
    this.skipWaitingForCenter.clear();
  }

  private setupConfig(): void {
    this.config.init({
      defaults: {
        pauseThreshold: 10,
        resumeOnSliderUp: true,
        skipCenter: 50,
        skipThreshold: 20,
      },
    });
  }

  private async setupSettingsPage(): Promise<void> {
    await this.settingsPage.addSettings((s) => {
      s.addSection("general").setName("General");

      s.addInput("pauseThreshold")
        .setLabel("Pause Threshold (0–100)")
        .setDesc("Slider position below which all media is paused")
        .setValue(String(this.config.get<number>("pauseThreshold", 10)))
        .onChange(({ value }) =>
          this.config.set("pauseThreshold", Number(value))
        );

      s.addSwitch("resumeOnSliderUp")
        .setLabel("Resume on slider up")
        .setDesc("Resume playback when the pause slider moves back above the threshold")
        .setValue(this.config.get<boolean>("resumeOnSliderUp", true))
        .onChange(({ value }) => this.config.set("resumeOnSliderUp", value));

      s.addInput("skipCenter")
        .setLabel("Skip Center Point (0–100)")
        .setDesc("The resting center position of the skip slider")
        .setValue(String(this.config.get<number>("skipCenter", 50)))
        .onChange(({ value }) => this.config.set("skipCenter", Number(value)));

      s.addInput("skipThreshold")
        .setLabel("Skip Distance (0–100)")
        .setDesc(
          "How far from center the slider must move to trigger skip or previous"
        )
        .setValue(String(this.config.get<number>("skipThreshold", 20)))
        .onChange(({ value }) =>
          this.config.set("skipThreshold", Number(value))
        );
    });
  }

  private setupPauseButton(): void {
    this.actionmapper
      .addSystemUtilButton("media-pause")
      .setTitle("Media: Pause")
      .setIcon("fas fa-pause fa-lg")
      .onClick(({ selected, channel }) => {
        if (selected) {
          this.pauseChannels.add(channel);
        } else {
          this.pauseChannels.delete(channel);
          this.pausedChannels.delete(channel);
        }
      })
      .setAutoPersist(true);
  }

  private setupSkipButton(): void {
    this.actionmapper
      .addSystemUtilButton("media-skip")
      .setTitle("Media: Skip")
      .setIcon("fas fa-forward fa-lg")
      .onClick(({ selected, channel }) => {
        if (selected) {
          this.skipChannels.add(channel);
          this.skipWaitingForCenter.set(channel, false);
        } else {
          this.skipChannels.delete(channel);
          this.skipWaitingForCenter.delete(channel);
        }
      })
      .setAutoPersist(true);
  }

  private setupDeviceUpdates(): void {
    this.device.onUpdate(({ changes }) => {
      for (const { index, newValue } of changes) {
        if (this.pauseChannels.has(index)) {
          this.handlePauseChannel(index, newValue);
        }
        if (this.skipChannels.has(index)) {
          this.handleSkipChannel(index, newValue);
        }
      }
    });
  }

  private handlePauseChannel(channel: number, value: number): void {
    const threshold = this.config.get<number>("pauseThreshold", 10);
    if (value < threshold) {
      if (!this.pausedChannels.has(channel)) {
        this.pausedChannels.add(channel);
        console.log("Pausing Channel", channel);
        pause("all").catch(() => {});
      }
    } else {
      if (this.pausedChannels.has(channel)) {
        this.pausedChannels.delete(channel);
        if (this.config.get<boolean>("resumeOnSliderUp", true)) {
          play("all").catch(() => {});
          console.log("Resuming Channel", channel);
        }
      }
    }
  }

  private handleSkipChannel(channel: number, value: number): void {
    const center = this.config.get<number>("skipCenter", 50);
    const threshold = this.config.get<number>("skipThreshold", 20);
    const waiting = this.skipWaitingForCenter.get(channel) ?? false;

    if (waiting) {
      if (Math.abs(value - center) <= threshold / 2) {
        this.skipWaitingForCenter.set(channel, false);
      }
      return;
    }

    if (value > center + threshold) {
      next("all").catch(() => {});
      this.skipWaitingForCenter.set(channel, true);
    } else if (value < center - threshold) {
      previous("all").catch(() => {});
      this.skipWaitingForCenter.set(channel, true);
    }
  }
}

runPlugin(MediaControlPlugin);
